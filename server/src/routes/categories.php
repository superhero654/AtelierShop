<?php
/**
 * 分类接口
 */

require_once __DIR__ . '/../helpers.php';

function register_categories_routes(Router $router, Database $db): void
{
    // GET /api/categories — 分类列表
    $router->get('/api/categories', function () use ($db) {
        json_response($db->table('categories')->all());
    });

    // GET /api/categories/:id — 单个分类
    $router->get('/api/categories/{id}', function (array $params) use ($db) {
        $cat = $db->table('categories')->find((int)$params['id']);
        if (!$cat) {
            return json_error('分类不存在', 404);
        }
        json_response($cat);
    });

    // POST /api/categories — 添加分类
    $router->post('/api/categories', function () use ($db) {
        $body = json_body();
        if (empty($body['name'])) {
            return json_error('分类名称不能为空');
        }
        $cat = $db->table('categories')->insert([
            'name' => $body['name'],
            'icon' => $body['icon'] ?? '📁',
            'description' => $body['description'] ?? '',
        ]);
        json_response($cat, 201);
    });

    // PUT /api/categories/:id — 更新分类
    $router->put('/api/categories/{id}', function (array $params) use ($db) {
        $id = (int)$params['id'];
        if (!$db->table('categories')->find($id)) {
            return json_error('分类不存在', 404);
        }
        $body = json_body();
        $updates = [];
        foreach (['name', 'icon', 'description'] as $key) {
            if (isset($body[$key])) $updates[$key] = $body[$key];
        }
        json_response($db->table('categories')->update($id, $updates));
    });

    // DELETE /api/categories/:id — 删除分类
    $router->delete('/api/categories/{id}', function (array $params) use ($db) {
        $id = (int)$params['id'];
        if (!$db->table('categories')->delete($id)) {
            return json_error('分类不存在', 404);
        }
        json_response(['message' => '已删除']);
    });
}
