<?php
/**
 * 辅助函数
 */

/** 读取 JSON 请求体 */
function json_body(): array
{
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}

/** 返回 JSON 响应 */
function json_response(mixed $data, int $code = 200): void
{
    http_response_code($code);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

/** 返回错误 JSON */
function json_error(string $message, int $code = 400): void
{
    json_response(['error' => $message], $code);
}

/** 获取请求头 */
function get_header(string $name): ?string
{
    $key = 'HTTP_' . strtoupper(str_replace('-', '_', $name));
    return $_SERVER[$key] ?? null;
}

/** 生成订单号 */
function generate_order_no(): string
{
    $now = new DateTime();
    return $now->format('YmdHisv');
}

/** 获取当前用户 ID（从 Header） */
function get_user_id(): ?int
{
    $val = get_header('X-User-Id');
    return $val ? (int)$val : null;
}

/** 获取当前管理员 ID（从 Header） */
function get_admin_id(): ?int
{
    $val = get_header('X-Admin-Id');
    return $val ? (int)$val : null;
}
