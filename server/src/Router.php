<?php
/**
 * 简易路由分发器
 */

class Router
{
    private array $routes = [];

    /** 注册路由：GET */
    public function get(string $path, callable $handler): void
    {
        $this->routes['GET'][$path] = $handler;
    }

    /** 注册路由：POST */
    public function post(string $path, callable $handler): void
    {
        $this->routes['POST'][$path] = $handler;
    }

    /** 注册路由：PUT */
    public function put(string $path, callable $handler): void
    {
        $this->routes['PUT'][$path] = $handler;
    }

    /** 注册路由：PATCH */
    public function patch(string $path, callable $handler): void
    {
        $this->routes['PATCH'][$path] = $handler;
    }

    /** 注册路由：DELETE */
    public function delete(string $path, callable $handler): void
    {
        $this->routes['DELETE'][$path] = $handler;
    }

    /** 匹配并执行路由 */
    public function dispatch(string $method, string $uri): void
    {
        // 去掉 query string
        $path = parse_url($uri, PHP_URL_PATH);
        $path = rtrim($path, '/') ?: '/';

        $routes = $this->routes[$method] ?? [];

        foreach ($routes as $pattern => $handler) {
            // 将 {id} 转为正则
            $regex = preg_replace('/\{(\w+)\}/', '(?P<$1>[^/]+)', $pattern);
            $regex = '#^' . $regex . '$#';

            if (preg_match($regex, $path, $matches)) {
                $params = array_filter($matches, 'is_string', ARRAY_FILTER_USE_KEY);
                $handler($params);
                return;
            }
        }

        // 未匹配返回 404
        http_response_code(404);
        json_error('接口不存在');
    }
}
