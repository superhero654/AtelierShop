import { useState, useContext, useCallback } from 'react';
import {
  Table, Button, Modal, Form, Input, InputNumber, Select, Switch,
  Space, Popconfirm, message, Tag, Image,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { ServiceContext } from '../../contexts/ServiceContext';
import { formatPrice } from '../../utils/format';
import ProtectedRoute from '../../components/ProtectedRoute';

function AdminProductContent() {
  const services = useContext(ServiceContext);
  const [data, setData] = useState(() => services.good.getGoodList());
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();

  const refresh = useCallback(() => {
    setData([...services.good.getGoodList()]);
  }, [services.good]);

  const categories = services.category.getCategoryList();

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ status: 'on', stock: 0, hot: false });
    setModalOpen(true);
  };

  const openEdit = (record) => {
    setEditing(record);
    form.setFieldsValue(record);
    setModalOpen(true);
  };

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      if (editing) {
        services.good.updateGood({ ...editing, ...values });
        message.success('商品已更新');
      } else {
        services.good.addGood(values);
        message.success('商品已添加');
      }
      setModalOpen(false);
      refresh();
    });
  };

  const handleDelete = (id) => {
    services.good.deleteGood(id);
    message.success('商品已删除');
    refresh();
  };

  const handleToggleStatus = (record) => {
    services.good.toggleStatus(record.id);
    message.success(record.status === 'on' ? '已下架' : '已上架');
    refresh();
  };

  const columns = [
    {
      title: '图片',
      dataIndex: 'img',
      width: 80,
      render: (img, record) => (
        <Image src={img} alt={record.name} width={48} height={48} style={{ objectFit: 'cover', borderRadius: 4 }} />
      ),
    },
    { title: '名称', dataIndex: 'name', ellipsis: true },
    {
      title: '价格',
      dataIndex: 'price',
      width: 100,
      render: (p) => formatPrice(p),
    },
    {
      title: '分类',
      dataIndex: 'categoryId',
      width: 100,
      render: (id) => categories.find((c) => c.id === id)?.name || id,
    },
    { title: '库存', dataIndex: 'stock', width: 80 },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (status, record) => (
        <Switch
          checked={status === 'on'}
          checkedChildren="上架"
          unCheckedChildren="下架"
          onChange={() => handleToggleStatus(record)}
          aria-label={`${record.name} 上下架`}
        />
      ),
    },
    {
      title: '热门',
      dataIndex: 'hot',
      width: 80,
      render: (hot) => hot ? <Tag color="red">热门</Tag> : '—',
    },
    {
      title: '操作',
      width: 160,
      render: (_, record) => (
        <Space>
          <Button type="link" icon={<EditOutlined aria-hidden="true" />} onClick={() => openEdit(record)} aria-label={`编辑 ${record.name}`}>
            编辑
          </Button>
          <Popconfirm title="确定删除该商品？" onConfirm={() => handleDelete(record.id)} okText="确定" cancelText="取消">
            <Button type="link" danger icon={<DeleteOutlined aria-hidden="true" />} aria-label={`删除 ${record.name}`}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>商品管理</h2>
        <Button type="primary" icon={<PlusOutlined aria-hidden="true" />} onClick={openCreate}>
          添加商品
        </Button>
      </div>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={data}
        pagination={{ pageSize: 10, showTotal: (t) => `共 ${t} 条` }}
      />

      <Modal
        title={editing ? '编辑商品' : '添加商品'}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
        okText="保存"
        cancelText="取消"
        destroyOnHidden
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="商品名称" rules={[{ required: true, message: '请输入商品名称' }]}>
            <Input placeholder="请输入商品名称…" />
          </Form.Item>
          <Form.Item name="price" label="价格" rules={[{ required: true, message: '请输入价格' }]}>
            <InputNumber min={0} precision={2} style={{ width: '100%' }} placeholder="0.00" />
          </Form.Item>
          <Form.Item name="categoryId" label="分类" rules={[{ required: true, message: '请选择分类' }]}>
            <Select placeholder="请选择分类…" options={categories.map((c) => ({ value: c.id, label: c.name }))} />
          </Form.Item>
          <Form.Item name="img" label="图片 URL" rules={[{ required: true, message: '请输入图片地址' }]}>
            <Input placeholder="https://…" />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={3} placeholder="商品描述…" />
          </Form.Item>
          <Form.Item name="stock" label="库存">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="status" label="状态">
            <Select options={[{ value: 'on', label: '上架' }, { value: 'off', label: '下架' }]} />
          </Form.Item>
          <Form.Item name="hot" label="热门推荐" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}

export default function AdminProductPage() {
  return (
    <ProtectedRoute requireAdmin allowedRoles={['admin']}>
      <AdminProductContent />
    </ProtectedRoute>
  );
}
