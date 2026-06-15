// src/pages/admin/AdminCategoryPage.jsx
import { useState, useContext, useCallback, useEffect } from 'react';
import {
  Table, Button, Modal, Form, Input, Space, Tooltip, message,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { ServiceContext } from '../../contexts/ServiceContext';
import confirmDelete from '../../utils/confirmDelete';
import ProtectedRoute from '../../components/ProtectedRoute';

function AdminCategoryContent() {
  const services = useContext(ServiceContext);
  const [categories, setCategories] = useState(() => services.category.getCategoryList());
  const [goods, setGoods] = useState(() => services.good.getGoodList());
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [loadingId, setLoadingId] = useState(null);
  const [form] = Form.useForm();

  const refresh = useCallback(() => {
    setCategories([...services.category.getCategoryList()]);
    setGoods([...services.good.getGoodList()]);
  }, [services.category, services.good]);

  useEffect(() => {
    if (!services.loading?.categories) refresh();
  }, [services.loading?.categories, refresh]);

  const getProductCount = (categoryId) => {
    return goods.filter((g) => g.categoryId === categoryId).length;
  };

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEdit = (record) => {
    setEditing(record);
    form.setFieldsValue({
      name: record.name,
      icon: record.icon,
      description: record.description,
    });
    setModalOpen(true);
  };

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      setSubmitting(true);
      const callbacks = {
        onSync: () => refresh(),
        onRollback: () => refresh(),
      };

      if (editing) {
        message.success('分类已更新');
        setModalOpen(false);
        refresh();
        services.category.updateCategoryOptimistic({ ...editing, ...values }, callbacks)
          .catch(() => message.error('操作失败，已回滚'))
          .finally(() => setSubmitting(false));
      } else {
        message.success('分类已添加');
        setModalOpen(false);
        refresh();
        services.category.addCategoryOptimistic(values, callbacks)
          .catch(() => message.error('操作失败，已回滚'))
          .finally(() => setSubmitting(false));
      }
    }).catch(() => {});
  };

  const handleDelete = (record) => {
    const count = getProductCount(record.id);
    if (count > 0) {
      Modal.error({
        title: '无法删除',
        content: `该分类下还有 ${count} 件商品，请先将商品移至其他分类后再删除`,
        centered: true,
      });
      return;
    }

    setLoadingId(record.id);
    confirmDelete({
      title: '确认删除',
      content: `确定要删除分类「${record.name}」吗？此操作不可撤销。`,
      onOk: () => {
        const callbacks = {
          onSync: () => refresh(),
          onRollback: () => refresh(),
        };
        message.success('分类已删除');
        refresh();
        services.category.deleteCategoryOptimistic(record.id, callbacks)
          .catch(() => message.error('删除失败，已回滚'))
          .finally(() => setLoadingId(null));
      },
    });
  };

  const columns = [
    {
      title: '图标',
      dataIndex: 'icon',
      width: 80,
      align: 'center',
    },
    {
      title: '分类名称',
      dataIndex: 'name',
      ellipsis: true,
    },
    {
      title: '描述',
      dataIndex: 'description',
      ellipsis: true,
      render: (text) => (
        <Tooltip title={text || '暂无描述'}>
          {text || '—'}
        </Tooltip>
      ),
    },
    {
      title: '商品数量',
      width: 100,
      align: 'center',
      render: (_, record) => getProductCount(record.id),
    },
    {
      title: '操作',
      key: 'actions',
      fixed: 'right',
      width: 150,
      render: (_, record) => (
        <Space size={4}>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined aria-hidden="true" />}
            onClick={() => openEdit(record)}
            aria-label={`编辑 ${record.name}`}
          >
            编辑
          </Button>
          <Button
            type="link"
            size="small"
            danger
            icon={<DeleteOutlined aria-hidden="true" />}
            loading={loadingId === record.id}
            onClick={() => handleDelete(record)}
            aria-label={`删除 ${record.name}`}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>分类管理</h2>
        <Button type="primary" icon={<PlusOutlined aria-hidden="true" />} onClick={openCreate}>
          新增分类
        </Button>
      </div>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={categories}
        loading={loading}
        scroll={{ x: 800 }}
        pagination={{ pageSize: 10, showTotal: (t) => `共 ${t} 条` }}
        locale={{ emptyText: '暂无分类数据' }}
      />

      <Modal
        title={editing ? '编辑分类' : '新增分类'}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
        okText="保存"
        cancelText="取消"
        confirmLoading={submitting}
        destroyOnHidden
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="分类名称"
            rules={[
              { required: true, message: '请输入分类名称' },
              { max: 20, message: '最多 20 个字' },
            ]}
          >
            <Input placeholder="请输入分类名称…" maxLength={20} />
          </Form.Item>
          <Form.Item
            name="icon"
            label="图标"
            rules={[{ required: true, message: '请输入图标 emoji' }]}
          >
            <Input placeholder="输入一个 emoji，如 🍎" maxLength={4} />
          </Form.Item>
          <Form.Item
            name="description"
            label="描述"
            rules={[{ max: 100, message: '最多 100 个字' }]}
          >
            <Input.TextArea rows={3} placeholder="分类描述（选填）…" maxLength={100} showCount />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}

export default function AdminCategoryPage() {
  return (
    <ProtectedRoute requireAdmin allowedRoles={['admin']}>
      <AdminCategoryContent />
    </ProtectedRoute>
  );
}
