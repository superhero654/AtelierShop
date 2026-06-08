<?php
/**
 * Atelier Shop API — PHP 后端入口
 *
 * 启动方式: php -S localhost:3001 server/public/index.php
 * 
 * 这个文件作为 PHP 内置服务器的路由器，将所有请求转发给路由分发器。
 * 对于静态文件请求（图片等），直接返回文件内容。
 */

// ── 如果是静态文件请求，直接返回 ──
$requestUri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// 映射到 public 目录下的静态文件
$staticFile = __DIR__ . $requestUri;
if ($requestUri !== '/' && file_exists($staticFile) && !is_dir($staticFile)) {
    $mimeTypes = [
        'js' => 'application/javascript',
        'css' => 'text/css',
        'png' => 'image/png',
        'jpg' => 'image/jpeg',
        'jpeg' => 'image/jpeg',
        'gif' => 'image/gif',
        'svg' => 'image/svg+xml',
        'ico' => 'image/x-icon',
        'json' => 'application/json',
        'woff2' => 'font/woff2',
    ];
    $ext = pathinfo($staticFile, PATHINFO_EXTENSION);
    if (isset($mimeTypes[$ext])) {
        header('Content-Type: ' . $mimeTypes[$ext]);
    }
    readfile($staticFile);
    return true;
}

// ── API 路由 ──
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-User-Id, X-Admin-Id');

// 预检请求直接返回
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    return;
}

// 加载核心
require_once __DIR__ . '/../src/Router.php';
require_once __DIR__ . '/../src/Database.php';
require_once __DIR__ . '/../src/helpers.php';

// 加载路由
require_once __DIR__ . '/../src/routes/goods.php';
require_once __DIR__ . '/../src/routes/categories.php';
require_once __DIR__ . '/../src/routes/auth.php';
require_once __DIR__ . '/../src/routes/orders.php';
require_once __DIR__ . '/../src/routes/carousel.php';

// 注册路由
$router = new Router();
register_goods_routes($router, $db);
register_categories_routes($router, $db);
register_auth_routes($router, $db);
register_orders_routes($router, $db);
register_carousel_routes($router, $db);

// 健康检查
$router->get('/api/health', function () {
    json_response(['status' => 'ok', 'timestamp' => date('c')]);
});

// 分发请求
try {
    $router->dispatch($_SERVER['REQUEST_METHOD'], $_SERVER['REQUEST_URI']);
} catch (Throwable $e) {
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode(['error' => '服务器内部错误: ' . $e->getMessage()], JSON_UNESCAPED_UNICODE);
}
