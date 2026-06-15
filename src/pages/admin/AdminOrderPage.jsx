// src/pages/admin/AdminOrderPage.jsx
import { useState, useContext, useCallback, useMemo, useEffect } from 'react';
import {
  Table, Button, Space, Tag, message, Tabs, Input, DatePicker,
  Row, Col, Drawer, Descriptions, Divider, Empty,
} from 'antd';
import { EyeOutlined, ReloadOutlined } from '@ant-design/icons';
import { ServiceContext } from '../../contexts/ServiceContext';
import goodService from '../../services/goodService';
import { formatDate } from '../../utils/format';
import { ORDER_STATUS } from '../../mock/seedData';
import ProtectedRoute from '../../components/ProtectedRoute';
import dayjs from 'dayjs';

const ORDER_STATUS_MAP = ORDER_STATUS;

const STATUS_TABS = [
  { key: '', label: '全部' },
  { key: '0', label: '待支付' },
  { key: '1', label: '已支付' },
  { key: '2', label: '已发货' },
  { key: '3', label: '已完成' },
  { key: '4', label: '已取消' },
];

function AdminOrderContent() {
  const services = useContext(ServiceContext);
  const [orderList, setOrderList] = useState(() => services.order.getAllOrders());
  const [activeTab, setActiveTab] = useState('');
  const [searchText, setSearchText] = useState('');
  const [dateRange, setDateRange] = useState(null);
  const [pendingOrderIds, setPendingOrderIds] = useState(() => new Set());
  const [refreshing, setRefreshing] = useState(false);

  const syncList = useCallback(() => {
    setOrderList([...services.order.getAllOrders()]);
  }, [services.order]);

  const orderCallbacks = useCallback(() => ({
    onSync: () => syncList(),
    onRollback: () => {
      syncList();
      message.error('操作失败，已回滚');
    },
  }), [syncList]);

  useEffect(() => {
    if (!services.loading?.orders) syncList();
  }, [services.loading?.orders, services.ordersTick, syncList]);

  const refreshOrders = useCallback(async () => {
    setRefreshing(true);
    try {
      await services.refreshCatalog('orders');
      syncList();
    } catch {
      message.error('刷新失败，请稍后重试');
    } finally {
      setRefreshing(false);
    }
  }, [services, syncList]);

  // Drawer
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  const selectedOrder = useMemo(
    () => (selectedOrderId != null ? services.order.getOrderById(selectedOrderId) : null),
    [selectedOrderId, orderList, services.order],
  );

  const markOrderPending = (orderId) => {
    setPendingOrderIds((prev) => new Set(prev).add(orderId));
  };

  const clearOrderPending = (orderId) => {
    setPendingOrderIds((prev) => {
      const next = new Set(prev);
      next.delete(orderId);
      return next;
    });
  };

  const runOrderAction = (orderId, action, successMsg) => {
    if (pendingOrderIds.has(orderId)) return;
    markOrderPending(orderId);

    action(orderCallbacks())
      .then(() => message.success(successMsg))
      .catch((err) => message.error(err?.message || '操作失败，请重试'))
      .finally(() => clearOrderPending(orderId));
  };

  const getActionButtons = (status, orderId) => {
    const s = Number(status);
    const handlePay = () => {
      runOrderAction(
        orderId,
        (cb) => services.order.updateOrderStatusOptimistic(orderId, 1, cb),
        '已标记为已付款',
      );
    };

    const handleCancel = () => {
      runOrderAction(orderId, (cb) => services.order.cancelOrderOptimistic(orderId, cb), '订单已取消');
    };

    const handleShip = () => {
      runOrderAction(
        orderId,
        (cb) => services.order.updateOrderStatusOptimistic(orderId, 2, cb),
        '已标记为已发货',
      );
    };

    const handleComplete = () => {
      runOrderAction(
        orderId,
        (cb) => services.order.updateOrderStatusOptimistic(orderId, 3, cb),
        '订单已完成',
      );
    };

    const disabled = pendingOrderIds.has(orderId);

    return (
      <Space size={4}>
        {s === 0 && (
          <>
            <Button type="link" size="small" disabled={disabled} onClick={handlePay}>标记已付款</Button>
            <Button type="link" size="small" danger disabled={disabled} onClick={handleCancel}>取消订单</Button>
          </>
        )}
        {s === 1 && (
          <>
            <Button type="link" size="small" disabled={disabled} onClick={handleShip}>标记已发货</Button>
            <Button type="link" size="small" danger disabled={disabled} onClick={handleCancel}>取消订单</Button>
          </>
        )}
        {s === 2 && (
          <Button type="link" size="small" disabled={disabled} onClick={handleComplete}>确认完成</Button>
        )}
      </Space>
    );
  };

  // 各状态数量（基于完整 orderList，不受筛选影响）
  const statusCounts = useMemo(() => {
    const counts = {};
    orderList.forEach((o) => {
      counts[o.status] = (counts[o.status] || 0) + 1;
    });
    return counts;
  }, [orderList]);

  const tabItems = useMemo(() => STATUS_TABS.map((tab) => ({
    key: tab.key,
    label: `${tab.label}${tab.key !== '' ? ` (${statusCounts[Number(tab.key)] || 0})` : ` (${orderList.length})`}`,
  })), [statusCounts, orderList.length]);

  // 前端过滤：Tab + 搜索 + 日期 三者 AND
  const displayList = useMemo(() => {
    let result = [...orderList];

    if (activeTab !== '') {
      result = result.filter((item) => item.status === Number(activeTab));
    }

    if (searchText) {
      const kw = searchText.toLowerCase();
      result = result.filter((item) =>
        item.orderNo.toLowerCase().includes(kw) ||
        (item.receiver && item.receiver.toLowerCase().includes(kw))
      );
    }

    if (dateRange && dateRange[0] && dateRange[1]) {
      const start = dayjs(dateRange[0]).startOf('day');
      const end = dayjs(dateRange[1]).endOf('day');
      result = result.filter((item) => {
        const t = dayjs(item.createTime);
        return t.isAfter(start) && t.isBefore(end);
      });
    }

    return result;
  }, [orderList, activeTab, searchText, dateRange]);

  const handleReset = () => {
    setSearchText('');
    setDateRange(null);
    setActiveTab('');
  };

  const openDetail = (record) => {
    setSelectedOrderId(record.id);
    setDrawerOpen(true);
  };

  const formatCurrency = (val) => {
    return `¥ ${Number(val).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const columns = [
    {
      title: '订单号',
      dataIndex: 'orderNo',
      ellipsis: true,
      render: (no) => <span translate="no">{no}</span>,
    },
    {
      title: '收货人',
      dataIndex: 'receiver',
      width: 100,
    },
    {
      title: '金额',
      dataIndex: 'totalPrice',
      width: 110,
      render: (p) => formatCurrency(p),
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (status) => {
        const info = ORDER_STATUS_MAP[status];
        return <Tag color={info?.color}>{info?.label}</Tag>;
      },
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      width: 160,
      render: (t) => formatDate(t),
    },
    {
      title: '操作',
      key: 'actions',
      fixed: 'right',
      width: 280,
      render: (_, record) => (
        <Space size={4}>
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => openDetail(record)}
          >
            查看详情
          </Button>
          {getActionButtons(record.status, record.id)}
        </Space>
      ),
    },
  ];

  const renderOrderStatusTag = (status) => {
    const info = ORDER_STATUS_MAP[status];
    return <Tag color={info?.color}>{info?.label}</Tag>;
  };

  const customEmpty = <Empty description="暂无订单数据" />;

  return (
    <>
      <h2 style={{ marginBottom: 16 }}>订单管理</h2>

      {/* 状态 Tabs */}
      <Tabs
        activeKey={activeTab}
        onChange={(key) => setActiveTab(key)}
        items={tabItems}
        style={{ marginBottom: 0 }}
      />

      {/* 搜索 + 日期筛选 */}
      <Row gutter={12} style={{ marginBottom: 16 }} align="middle">
        <Col>
          <Input
            placeholder="搜索订单号或用户名"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 220 }}
            allowClear
          />
        </Col>
        <Col>
          <DatePicker.RangePicker
            style={{ width: 240 }}
            value={dateRange}
            onChange={(val) => setDateRange(val)}
            placeholder={['开始日期', '结束日期']}
          />
        </Col>
        <Col>
          <Button onClick={handleReset}>重置</Button>
        </Col>
        <Col>
          <Button icon={<ReloadOutlined />} loading={refreshing} onClick={refreshOrders}>
            刷新
          </Button>
        </Col>
      </Row>

      <Table
        rowKey={(record) => `${record.id}-${record.status}`}
        columns={columns}
        dataSource={displayList}
        loading={services.loading?.orders || refreshing}
        scroll={{ x: 1000 }}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '50'],
          showTotal: (t) => `共 ${t} 条`,
        }}
        locale={{ emptyText: customEmpty }}
      />

      {/* 订单详情 Drawer */}
      <Drawer
        title="订单详情"
        open={drawerOpen}
        onClose={() => { setDrawerOpen(false); setSelectedOrderId(null); }}
        width={520}
        destroyOnClose
      >
        {selectedOrder && (
          <>
            {/* 基本信息 */}
            <Descriptions bordered column={1} size="small" style={{ marginBottom: 24 }}>
              <Descriptions.Item label="订单号">
                <span translate="no">{selectedOrder.orderNo}</span>
              </Descriptions.Item>
              <Descriptions.Item label="下单时间">
                {formatDate(selectedOrder.createTime)}
              </Descriptions.Item>
              <Descriptions.Item label="订单状态">
                {renderOrderStatusTag(selectedOrder.status)}
              </Descriptions.Item>
              <Descriptions.Item label="实付金额">
                {formatCurrency(selectedOrder.totalPrice)}
              </Descriptions.Item>
            </Descriptions>

            {/* 收货信息 */}
            <div style={{ marginBottom: 24 }}>
              <h4 style={{ marginBottom: 12 }}>收货信息</h4>
              {(selectedOrder.receiver || selectedOrder.address) ? (
                <Descriptions bordered column={1} size="small">
                  <Descriptions.Item label="收货人">{selectedOrder.receiver || '—'}</Descriptions.Item>
                  <Descriptions.Item label="手机号">{selectedOrder.phone || '—'}</Descriptions.Item>
                  <Descriptions.Item label="收货地址">{selectedOrder.address || '—'}</Descriptions.Item>
                </Descriptions>
              ) : (
                <div style={{ color: '#999' }}>暂无收货信息</div>
              )}
            </div>

            {/* 商品清单 */}
            <div style={{ marginBottom: 24 }}>
              <h4 style={{ marginBottom: 12 }}>商品清单</h4>
              <Table
                rowKey="goodId"
                dataSource={selectedOrder.items || []}
                pagination={false}
                bordered={false}
                size="small"
                columns={[
                  {
                    title: '商品名称',
                    dataIndex: 'goodId',
                    render: (id) => {
                      const good = goodService.getGoodById(id);
                      return good?.name || `商品#${id}`;
                    },
                  },
                  {
                    title: '单价',
                    dataIndex: 'price',
                    width: 100,
                    render: (p) => formatCurrency(p),
                  },
                  {
                    title: '数量',
                    dataIndex: 'count',
                    width: 60,
                    align: 'center',
                  },
                  {
                    title: '小计',
                    width: 100,
                    render: (_, item) => formatCurrency(item.price * item.count),
                  },
                ]}
              />
              <Divider style={{ margin: '12px 0' }} />
              <div style={{ textAlign: 'right', fontSize: 15, fontWeight: 600 }}>
                合计：{formatCurrency(selectedOrder.totalPrice)}
              </div>
            </div>

            {/* 操作区 */}
            {(Number(selectedOrder.status) === 0 || Number(selectedOrder.status) === 1 || Number(selectedOrder.status) === 2) && (
              <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 16 }}>
                {getActionButtons(selectedOrder.status, selectedOrder.id)}
              </div>
            )}
          </>
        )}
      </Drawer>
    </>
  );
}

export default function AdminOrderPage() {
  return (
    <ProtectedRoute requireAdmin>
      <AdminOrderContent />
    </ProtectedRoute>
  );
}
