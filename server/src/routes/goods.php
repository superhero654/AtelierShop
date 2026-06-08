<?php
/**
 * 商品接口
 */

require_once __DIR__ . '/../helpers.php';

function register_goods_routes(Router $router, Database $db): void
{
    // GET /api/goods — 商品列表（支持筛选）
    $router->get('/api/goods', function () use ($db) {
        $result = $db->table('goods')->all();

        if ($status = $_GET['status'] ?? null) {
            $result = array_values(array_filter($result, fn($g) => ($g['status'] ?? '') === $status));
        }
        if ($categoryId = $_GET['categoryId'] ?? null) {
            $result = array_values(array_filter($result, fn($g) => ($g['categoryId'] ?? 0) === (int)$categoryId));
        }
        if ($hot = $_GET['hot'] ?? null) {
            $result = array_values(array_filter($result, fn($g) => !empty($g['hot'])));
        }
        if ($keyword = $_GET['keyword'] ?? null) {
            $kw = mb_strtolower($keyword);
            $result = array_values(array_filter($result, function ($g) use ($kw) {
                return mb_strpos(mb_strtolower($g['name'] ?? ''), $kw) !== false
                    || mb_strpos(mb_strtolower($g['description'] ?? ''), $kw) !== false;
            }));
        }

        json_response($result);
    });

    // GET /api/goods/:id — 商品详情
    $router->get('/api/goods/{id}', function (array $params) use ($db) {
        $good = $db->table('goods')->find((int)$params['id']);
        if (!$good) {
            return json_error('商品不存在', 404);
        }
        json_response($good);
    });

    // POST /api/goods — 添加商品
    $router->post('/api/goods', function () use ($db) {
        $body = json_body();
        $errors = [];

        if (empty($body['name'])) $errors[] = '商品名称不能为空';
        if (!isset($body['price']) || !is_numeric($body['price'])) $errors[] = '价格无效';
        if (empty($body['categoryId'])) $errors[] = '分类不能为空';
        if (empty($body['img'])) $errors[] = '图片地址不能为空';

        if ($errors) {
            return json_error(implode('；', $errors));
        }

        $good = $db->table('goods')->insert([
            'name' => $body['name'],
            'price' => (float)$body['price'],
            'categoryId' => (int)$body['categoryId'],
            'img' => $body['img'],
            'description' => $body['description'] ?? '',
            'stock' => (int)($body['stock'] ?? 0),
            'status' => $body['status'] ?? 'on',
            'hot' => !empty($body['hot']),
        ]);

        json_response($good, 201);
    });

    // PUT /api/goods/:id — 更新商品
    $router->put('/api/goods/{id}', function (array $params) use ($db) {
        $id = (int)$params['id'];
        $existing = $db->table('goods')->find($id);
        if (!$existing) {
            return json_error('商品不存在', 404);
        }

        $body = json_body();
        $updates = [];

        foreach (['name', 'price', 'categoryId', 'img', 'description', 'stock', 'status', 'hot'] as $key) {
            if (isset($body[$key])) {
                $updates[$key] = $body[$key];
            }
        }
        if (isset($updates['price'])) $updates['price'] = (float)$updates['price'];
        if (isset($updates['categoryId'])) $updates['categoryId'] = (int)$updates['categoryId'];
        if (isset($updates['stock'])) $updates['stock'] = (int)$updates['stock'];
        if (isset($updates['hot'])) $updates['hot'] = !empty($updates['hot']);

        $updated = $db->table('goods')->update($id, $updates);
        json_response($updated);
    });

    // DELETE /api/goods/:id — 删除商品
    $router->delete('/api/goods/{id}', function (array $params) use ($db) {
        $id = (int)$params['id'];
        if (!$db->table('goods')->delete($id)) {
            return json_error('商品不存在', 404);
        }
        json_response(['message' => '已删除']);
    });

    // PATCH /api/goods/:id/toggle-status — 切换上下架
    $router->patch('/api/goods/{id}/toggle-status', function (array $params) use ($db) {
        $id = (int)$params['id'];
        $good = $db->table('goods')->find($id);
        if (!$good) {
            return json_error('商品不存在', 404);
        }
        $newStatus = ($good['status'] ?? 'on') === 'on' ? 'off' : 'on';
        $updated = $db->table('goods')->update($id, ['status' => $newStatus]);
        json_response($updated);
    });
}
