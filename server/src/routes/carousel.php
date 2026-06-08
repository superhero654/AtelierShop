<?php
/**
 * 轮播图接口
 */

require_once __DIR__ . '/../helpers.php';

function register_carousel_routes(Router $router, Database $db): void
{
    $router->get('/api/carousel', function () use ($db) {
        json_response($db->table('carousel')->all());
    });
}
