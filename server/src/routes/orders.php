<?php
/**
 * 订单接口
 */

require_once __DIR__ . '/../helpers.php';

function register_orders_routes(Router $router, Database $db): void
{
    // GET /api/orders — 订单列表
    $router->get('/api/orders', function () use ($db) {
        $userId = get_user_id();
        $adminId = get_admin_id();

        $orders = $db->table('orders')->all();

        if ($userId) {
            $orders = array_values(array_filter($orders, fn($o) => ($o['userId'] ?? 0) === $userId));
        }

        usort($orders, fn($a, $b) => strcmp($b['createTime'] ?? '', $a['createTime'] ?? ''));
        json_response($orders);
    });

    // GET /api/orders/:id — 订单详情
    $router->get('/api/orders/{id}', function (array $params) use ($db) {
        $order = $db->table('orders')->find((int)$params['id']);
        if (!$order) {
            return json_error('订单不存在', 404);
        }
        json_response($order);
    });

    // POST /api/orders — 创建订单
    $router->post('/api/orders', function () use ($db) {
        $userId = get_user_id();
        if (!$userId) {
            return json_error('请先登录', 401);
        }

        $body = json_body();
        $errors = [];

        if (empty($body['items']) || !is_array($body['items'])) $errors[] = '订单商品不能为空';
        if (empty($body['address'])) $errors[] = '收货地址不能为空';
        if (empty($body['receiver'])) $errors[] = '收货人不能为空';
        if (empty($body['phone'])) $errors[] = '手机号不能为空';

        if ($errors) {
            return json_error(implode('；', $errors));
        }

        $order = $db->table('orders')->insert([
            'userId' => $userId,
            'orderNo' => generate_order_no(),
            'createTime' => date('c'),
            'payTime' => null,
            'status' => 0,
            'totalPrice' => (float)($body['totalPrice'] ?? 0),
            'address' => $body['address'],
            'receiver' => $body['receiver'],
            'phone' => $body['phone'],
            'items' => $body['items'],
            'logistics' => null,
        ]);

        json_response($order, 201);
    });

    // PATCH /api/orders/:id/pay — 支付订单
    $router->patch('/api/orders/{id}/pay', function (array $params) use ($db) {
        $order = $db->table('orders')->find((int)$params['id']);
        if (!$order) return json_error('订单不存在', 404);
        if (($order['status'] ?? -1) !== 0) return json_error('订单状态不允许支付');

        $updated = $db->table('orders')->update($order['id'], [
            'status' => 1,
            'payTime' => date('c'),
        ]);
        json_response($updated);
    });

    // PATCH /api/orders/:id/cancel — 取消订单
    $router->patch('/api/orders/{id}/cancel', function (array $params) use ($db) {
        $order = $db->table('orders')->find((int)$params['id']);
        if (!$order) return json_error('订单不存在', 404);
        if (($order['status'] ?? -1) !== 0) return json_error('当前状态不允许取消');

        $updated = $db->table('orders')->update($order['id'], ['status' => 4]);
        json_response($updated);
    });

    // PATCH /api/orders/:id/ship — 发货（管理员）
    $router->patch('/api/orders/{id}/ship', function (array $params) use ($db) {
        $adminId = get_admin_id();
        if (!$adminId) return json_error('请先登录管理员账号', 401);

        $order = $db->table('orders')->find((int)$params['id']);
        if (!$order) return json_error('订单不存在', 404);
        if (($order['status'] ?? -1) !== 1) return json_error('订单状态不允许发货');

        $updated = $db->table('orders')->update($order['id'], [
            'status' => 2,
            'logistics' => [
                'company' => '顺丰速运',
                'trackingNo' => 'SF' . time(),
                'status' => '运输中',
            ],
        ]);
        json_response($updated);
    });

    // PATCH /api/orders/:id/complete — 确认收货
    $router->patch('/api/orders/{id}/complete', function (array $params) use ($db) {
        $order = $db->table('orders')->find((int)$params['id']);
        if (!$order) return json_error('订单不存在', 404);
        if (($order['status'] ?? -1) !== 2) return json_error('订单状态不允许确认收货');

        $logistics = $order['logistics'] ?? null;
        if ($logistics) {
            $logistics['status'] = '已签收';
        }

        $updated = $db->table('orders')->update($order['id'], ['status' => 3, 'logistics' => $logistics]);
        json_response($updated);
    });

    // PATCH /api/orders/:id/status — 更新订单状态（管理员通用）
    $router->patch('/api/orders/{id}/status', function (array $params) use ($db) {
        $adminId = get_admin_id();
        if (!$adminId) return json_error('请先登录管理员账号', 401);

        $order = $db->table('orders')->find((int)$params['id']);
        if (!$order) return json_error('订单不存在', 404);

        $body = json_body();
        if (!isset($body['status'])) return json_error('缺少 status 字段');

        $updated = $db->table('orders')->update($order['id'], ['status' => (int)$body['status']]);
        json_response($updated);
    });
}
