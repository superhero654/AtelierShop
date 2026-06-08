<?php
/**
 * 认证与用户接口
 */

require_once __DIR__ . '/../helpers.php';

function register_auth_routes(Router $router, Database $db): void
{
    // POST /api/auth/login — 用户登录
    $router->post('/api/auth/login', function () use ($db) {
        $body = json_body();
        $username = $body['username'] ?? '';
        $password = $body['password'] ?? '';

        if (!$username || !$password) {
            return json_error('请输入用户名和密码');
        }

        foreach ($db->table('users')->all() as $u) {
            if (($u['username'] === $username || $u['email'] === $username) && $u['password'] === $password) {
                unset($u['password']);
                return json_response($u);
            }
        }

        json_error('用户名或密码错误', 401);
    });

    // POST /api/auth/register — 用户注册
    $router->post('/api/auth/register', function () use ($db) {
        $body = json_body();
        $username = $body['username'] ?? '';
        $email = $body['email'] ?? '';
        $password = $body['password'] ?? '';

        $errors = [];
        if (!$username) $errors[] = '用户名不能为空';
        if (!$email) $errors[] = '邮箱不能为空';
        if (strlen($password) < 6) $errors[] = '密码至少 6 位';
        if ($errors) {
            return json_error(implode('；', $errors));
        }

        foreach ($db->table('users')->all() as $u) {
            if ($u['username'] === $username || $u['email'] === $email) {
                return json_error('用户名或邮箱已被注册', 409);
            }
        }

        $user = $db->table('users')->insert([
            'username' => $username,
            'email' => $email,
            'password' => $password,
            'nickname' => $body['nickname'] ?? $username,
            'phone' => '',
            'address' => '',
        ]);

        unset($user['password']);
        json_response($user, 201);
    });

    // POST /api/auth/admin/login — 管理员登录
    $router->post('/api/auth/admin/login', function () use ($db) {
        $body = json_body();
        $username = $body['username'] ?? '';
        $password = $body['password'] ?? '';

        if (!$username || !$password) {
            return json_error('请输入管理员账号和密码');
        }

        foreach ($db->table('admins')->all() as $a) {
            if ($a['username'] === $username && $a['password'] === $password) {
                unset($a['password']);
                return json_response($a);
            }
        }

        json_error('管理员账号或密码错误', 401);
    });

    // GET /api/auth/user/:id — 获取用户信息
    $router->get('/api/auth/user/{id}', function (array $params) use ($db) {
        $user = $db->table('users')->find((int)$params['id']);
        if (!$user) {
            return json_error('用户不存在', 404);
        }
        unset($user['password']);
        json_response($user);
    });

    // PUT /api/auth/user/:id — 更新用户信息
    $router->put('/api/auth/user/{id}', function (array $params) use ($db) {
        $id = (int)$params['id'];
        $existing = $db->table('users')->find($id);
        if (!$existing) {
            return json_error('用户不存在', 404);
        }

        $body = json_body();
        $updates = [];
        foreach (['nickname', 'phone', 'address', 'email'] as $key) {
            if (isset($body[$key])) $updates[$key] = $body[$key];
        }

        $updated = $db->table('users')->update($id, $updates);
        unset($updated['password']);
        json_response($updated);
    });

    // GET /api/auth/admins — 管理员列表
    $router->get('/api/auth/admins', function () use ($db) {
        $adminId = get_admin_id();
        if (!$adminId) {
            return json_error('请先登录管理员账号', 401);
        }
        $list = array_map(function ($a) {
            unset($a['password']);
            return $a;
        }, $db->table('admins')->all());
        json_response($list);
    });
}
