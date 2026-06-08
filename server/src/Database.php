<?php
/**
 * 简易 JSON 文件数据库
 * 数据存储在 server/data/ 目录下，每个表一个 JSON 文件
 */

class Database
{
    private string $dataDir;
    private array $cache = [];

    public function __construct()
    {
        $this->dataDir = __DIR__ . '/../data';
        if (!is_dir($this->dataDir)) {
            mkdir($this->dataDir, 0755, true);
        }
    }

    public function table(string $name): Table
    {
        if (!isset($this->cache[$name])) {
            $this->cache[$name] = new Table($this->dataDir, $name);
        }
        return $this->cache[$name];
    }
}

class Table
{
    private string $filePath;
    private array $data;

    public function __construct(string $dataDir, string $name)
    {
        $this->filePath = $dataDir . '/' . $name . '.json';
        $this->load();
    }

    private function load(): void
    {
        if (file_exists($this->filePath)) {
            $raw = file_get_contents($this->filePath);
            $this->data = json_decode($raw, true) ?? [];
        } else {
            $this->data = [];
            $this->save();
        }
    }

    private function save(): void
    {
        file_put_contents(
            $this->filePath,
            json_encode($this->data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT)
        );
    }

    /** 用种子数据初始化（仅在数据为空时） */
    public function seed(array $rows): void
    {
        if (empty($this->data)) {
            $this->data = $rows;
            $this->save();
        }
    }

    public function all(): array
    {
        return $this->data;
    }

    public function find(int $id): ?array
    {
        foreach ($this->data as $row) {
            if (($row['id'] ?? 0) === $id) {
                return $row;
            }
        }
        return null;
    }

    public function insert(array $row): array
    {
        $maxId = 0;
        foreach ($this->data as $r) {
            if (($r['id'] ?? 0) > $maxId) $maxId = $r['id'];
        }
        $row['id'] = $maxId + 1;
        $this->data[] = $row;
        $this->save();
        return $row;
    }

    public function update(int $id, array $updates): ?array
    {
        foreach ($this->data as &$row) {
            if (($row['id'] ?? 0) === $id) {
                foreach ($updates as $key => $value) {
                    $row[$key] = $value;
                }
                $this->save();
                return $row;
            }
        }
        return null;
    }

    public function delete(int $id): bool
    {
        foreach ($this->data as $i => $row) {
            if (($row['id'] ?? 0) === $id) {
                array_splice($this->data, $i, 1);
                $this->save();
                return true;
            }
        }
        return false;
    }
}

// ── 全局单例 ──
$db = new Database();

// ── 种子数据 ──
$db->table('categories')->seed([
    ['id' => 1, 'name' => '数码科技', 'icon' => '📱', 'description' => '手机、耳机、电脑，反正买新不买旧'],
    ['id' => 2, 'name' => '时尚服饰', 'icon' => '👗', 'description' => '衣柜里总缺那么一件'],
    ['id' => 3, 'name' => '家居生活', 'icon' => '🏠', 'description' => '住得舒服比什么都重要'],
    ['id' => 4, 'name' => '美妆护肤', 'icon' => '✨', 'description' => '对自己好一点，不贵'],
    ['id' => 5, 'name' => '运动户外', 'icon' => '🏃', 'description' => '买装备≈练过了'],
    ['id' => 6, 'name' => '图书文具', 'icon' => '📚', 'description' => '看书和买书是两回事'],
]);

$db->table('goods')->seed([
    ['id' => 1, 'name' => '无线降噪耳机 Pro', 'price' => 1299, 'categoryId' => 1, 'img' => '/img.png', 'description' => '主动降噪，40小时续航，Hi-Fi 音质，舒适佩戴体验。', 'stock' => 50, 'status' => 'on', 'hot' => true],
    ['id' => 2, 'name' => '智能手表 Ultra', 'price' => 2499, 'categoryId' => 1, 'img' => '/img_1.png', 'description' => '健康监测、GPS 定位、50米防水，全天候智能伴侣。', 'stock' => 30, 'status' => 'on', 'hot' => true],
    ['id' => 3, 'name' => '极简羊毛大衣', 'price' => 1899, 'categoryId' => 2, 'img' => '/img_2.png', 'description' => '100% 澳洲美利奴羊毛，经典剪裁，温暖有型。', 'stock' => 20, 'status' => 'on', 'hot' => true],
    ['id' => 4, 'name' => '真皮手提包', 'price' => 1599, 'categoryId' => 2, 'img' => '/img_4.png', 'description' => '头层牛皮，手工缝制，大容量设计，商务通勤皆宜。', 'stock' => 15, 'status' => 'on', 'hot' => false],
    ['id' => 5, 'name' => '北欧风台灯', 'price' => 399, 'categoryId' => 3, 'img' => '/img_3.png', 'description' => '三档调光，护眼无频闪，简约设计点缀居家空间。', 'stock' => 80, 'status' => 'on', 'hot' => true],
    ['id' => 6, 'name' => '记忆棉枕头', 'price' => 299, 'categoryId' => 3, 'img' => '/img_5.png', 'description' => '人体工学曲线，慢回弹材质，深度睡眠从此开始。', 'stock' => 100, 'status' => 'on', 'hot' => false],
    ['id' => 7, 'name' => '精华护肤套装', 'price' => 899, 'categoryId' => 4, 'img' => '/img_6.png', 'description' => '三重玻尿酸配方，深层补水，焕活肌肤光泽。', 'stock' => 40, 'status' => 'on', 'hot' => true],
    ['id' => 8, 'name' => '专业跑鞋', 'price' => 799, 'categoryId' => 5, 'img' => '/img_7.png', 'description' => '碳板科技，轻量回弹，马拉松级缓震保护。', 'stock' => 60, 'status' => 'on', 'hot' => false],
    ['id' => 9, 'name' => '露营帐篷 4人', 'price' => 1299, 'categoryId' => 5, 'img' => '/img_8.png', 'description' => '防雨防风，快速搭建，户外露营的理想选择。', 'stock' => 25, 'status' => 'on', 'hot' => false],
    ['id' => 10, 'name' => '设计思维经典', 'price' => 68, 'categoryId' => 6, 'img' => '/img_9.png', 'description' => 'IDEO 设计方法论经典之作，激发创意灵感。', 'stock' => 200, 'status' => 'on', 'hot' => false],
    ['id' => 11, 'name' => '机械键盘 RGB', 'price' => 599, 'categoryId' => 1, 'img' => '/img_10.png', 'description' => '青轴手感，全键无冲，1680万色 RGB 灯效。', 'stock' => 45, 'status' => 'off', 'hot' => false],
    ['id' => 12, 'name' => '真丝围巾', 'price' => 459, 'categoryId' => 2, 'img' => '/img_7.png', 'description' => '100% 桑蚕丝，手工印花，四季百搭单品。', 'stock' => 35, 'status' => 'on', 'hot' => false],
]);

$db->table('users')->seed([
    ['id' => 1, 'username' => 'demo', 'email' => 'demo@shop.com', 'password' => '123456', 'nickname' => '演示用户', 'phone' => '13800138000', 'address' => '北京市朝阳区建国路 88 号'],
    ['id' => 2, 'username' => 'test', 'email' => 'test@shop.com', 'password' => '123456', 'nickname' => '测试用户', 'phone' => '13900139000', 'address' => '上海市浦东新区陆家嘴环路 1000 号'],
]);

$db->table('admins')->seed([
    ['id' => 1, 'username' => 'admin', 'password' => 'admin123', 'role' => 'admin', 'name' => '系统管理员'],
    ['id' => 2, 'username' => 'operator', 'password' => 'op123456', 'role' => 'operator', 'name' => '运营专员'],
]);

$db->table('orders')->seed([
    ['id' => 1, 'userId' => 1, 'orderNo' => '202601010001', 'createTime' => '2026-01-01T10:00:00', 'payTime' => '2026-01-01T10:05:00', 'status' => 3, 'totalPrice' => 1299, 'address' => '北京市朝阳区建国路 88 号', 'receiver' => '演示用户', 'phone' => '13800138000', 'items' => [['goodId' => 1, 'count' => 1, 'price' => 1299]], 'logistics' => ['company' => '顺丰速运', 'trackingNo' => 'SF1234567890', 'status' => '已签收']],
]);

$db->table('carousel')->seed([
    ['id' => 1, 'title' => '春季新品上市', 'subtitle' => '精选好物，限时优惠', 'img' => 'https://picsum.photos/seed/banner1/1400/500', 'link' => '/category/2'],
    ['id' => 2, 'title' => '数码科技节', 'subtitle' => '智能设备低至 7 折', 'img' => 'https://picsum.photos/seed/banner2/1400/500', 'link' => '/category/1'],
    ['id' => 3, 'title' => '品质家居', 'subtitle' => '打造理想生活空间', 'img' => 'https://picsum.photos/seed/banner3/1400/500', 'link' => '/category/3'],
    ['id' => 4, 'title' => '运动户外季', 'subtitle' => '探索自然，释放活力', 'img' => 'https://picsum.photos/seed/banner4/1400/500', 'link' => '/category/5'],
]);
