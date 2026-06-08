import { useState, useContext, useCallback } from 'react';
import { Table, Button, Space, Tag, Select, Popconfirm, message } from 'antd';
import { ServiceContext } from '../../contexts/ServiceContext';
import { formatPrice, formatDate } from '../../utils/format';
import { ORDER_STATUS } from '../../mock/seedData';
import ProtectedRoute from '../../components/ProtectedRoute';

const STATUS_OPTIONS = Object.entries(ORDER_STATUS).map(([value, { label }]) => ({
  value: Number(value),
  label,
}));

function AdminOrderContent() {
  const services = useContext(ServiceContext);
  const [data, setData] = useState(() => services.order.getAllOrders());

  const refresh = useCallback(() => {
    setData([...services.order.getAllOrders()]);
  }, [services.order]);

  const handleShip = async (id) => {
    const ok = await services.order.shipOrder(id);
    if (ok) {
      message.success('已发货');
      refresh();
    } else {
      message.error('发货失败，请确认订单状态为已支付');
    }
  };

  const handleStatusChange = async (id, status) => {
    await services.order.updateOrderStatus(id, status);
    message.success('状态已更新');
    refresh();
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
      width: 100,
      render: (p) => formatPrice(p),
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (status) => {
        const info = ORDER_STATUS[status];
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
      width: 220,
      render: (_, record) => (
        <Space>
          {record.status === 1 && (
            <Popconfirm title="确认发货？" onConfirm={() => handleShip(record.id)} okText="确定" cancelText="取消">
              <Button type="link" size="small">发货</Button>
            </Popconfirm>
          )}
          <Select
            size="small"
            style={{ width: 110 }}
            value={record.status}
            options={STATUS_OPTIONS}
            onChange={(val) => handleStatusChange(record.id, val)}
            aria-label={`修改订单 ${record.orderNo} 状态`}
          />
        </Space>
      ),
    },
  ];

  return (
    <>
      <h2 style={{ marginBottom: 16 }}>订单管理</h2>
      <Table
        rowKey="id"
        columns={columns}
        dataSource={data}
        pagination={{ pageSize: 10, showTotal: (t) => `共 ${t} 条` }}
        expandable={{
          expandedRowRender: (record) => (
            <div style={{ fontSize: 13, lineHeight: 2 }}>
              <p><strong>手机号：</strong>{record.phone}</p>
              <p><strong>地址：</strong>{record.address}</p>
              <p><strong>商品：</strong>
                {(record.items || []).map((item) => {
                  const good = services.good.getGoodById(item.goodId);
                  return `${good?.name || item.goodId} × ${item.count}`;
                }).join('、')}
              </p>
              {record.logistics && (
                <p><strong>物流：</strong>{record.logistics.company} · {record.logistics.trackingNo} · {record.logistics.status}</p>
              )}
            </div>
          ),
        }}
      />
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
