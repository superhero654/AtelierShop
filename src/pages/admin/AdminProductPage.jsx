// src/pages/admin/AdminProductPage.jsx
import { useState, useContext, useCallback, useMemo } from 'react';
import {
  Table, Button, Modal, Form, Input, InputNumber, Select, Switch,
  Space, message, Tag, Image, Row, Col, Tooltip, Empty, Upload,
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined,
  PictureOutlined, UploadOutlined,
} from '@ant-design/icons';
import { ServiceContext } from '../../contexts/ServiceContext';
import { formatPrice } from '../../utils/format';
import confirmDelete from '../../utils/confirmDelete';
import ProtectedRoute from '../../components/ProtectedRoute';
import { uploadFile } from '../../services/uploadService';

const STATUS_FILTER_OPTIONS = [
  { value: '', label: '全部' },
  { value: 'active', label: '上架' },
  { value: 'inactive', label: '下架' },
];

function AdminProductContent() {
  const services = useContext(ServiceContext);
  const [productList, setProductList] = useState(() => services.good.getGoodList());
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingId, setLoadingId] = useState(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [previewUrl, setPreviewUrl] = useState('');
  const [imgError, setImgError] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form] = Form.useForm();

  // 搜索筛选状态
  const [searchKeyword, setSearchKeyword] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const categories = services.category.getCategoryList();

  const refresh = useCallback(() => {
    setProductList([...services.good.getGoodList()]);
  }, [services.good]);

  const categoryOptions = useMemo(() => [
    { value: '', label: '全部分类' },
    ...categories.map((c) => ({ value: c.id, label: c.name })),
  ], [categories]);

  // 前端过滤：三个条件 AND 叠加
  const displayList = useMemo(() => {
    let result = [...productList];
    if (searchKeyword) {
      const kw = searchKeyword.toLowerCase();
      result = result.filter((item) => item.name.toLowerCase().includes(kw));
    }
    if (filterCategory) {
      result = result.filter((item) => item.categoryId === Number(filterCategory));
    }
    if (filterStatus) {
      if (filterStatus === 'active') {
        result = result.filter((item) => item.status === 'on');
      } else if (filterStatus === 'inactive') {
        result = result.filter((item) => item.status === 'off');
      }
    }
    return result;
  }, [productList, searchKeyword, filterCategory, filterStatus]);

  const handleReset = () => {
    setSearchKeyword('');
    setFilterCategory('');
    setFilterStatus('');
  };

  const openCreate = () => {
    setEditing(null);
    setPreviewUrl('');
    setImgError(false);
    form.resetFields();
    form.setFieldsValue({ status: 'on', stock: 0, hot: false });
    setModalOpen(true);
  };

  const openEdit = (record) => {
    setEditing(record);
    setPreviewUrl(record.img || '');
    setImgError(false);
    form.setFieldsValue(record);
    setModalOpen(true);
  };

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      try {
        if (editing) {
          services.good.updateGood({ ...editing, ...values });
          message.success('商品已更新');
        } else {
          services.good.addGood(values);
          message.success('商品已添加');
        }
        setModalOpen(false);
        refresh();
      } catch (err) {
        message.error('操作失败，请重试');
      }
    }).catch(() => {});
  };

  const handleDelete = (id) => {
    const record = productList.find((item) => item.id === id);
    setLoadingId(id);
    confirmDelete({
      title: '确认删除',
      content: `确定要删除商品「${record?.name || id}」吗？此操作不可撤销。`,
      onOk: () => {
        try {
          services.good.deleteGood(id);
          message.success('商品已删除');
          refresh();
        } catch (err) {
          message.error('删除失败');
        } finally {
          setLoadingId(null);
        }
      },
    });
  };

  const handleToggleStatus = (record) => {
    try {
      services.good.toggleStatus(record.id);
      message.success(record.status === 'on' ? '已下架' : '已上架');
      refresh();
    } catch (err) {
      message.error('操作失败');
    }
  };

  // 批量上架 / 下架
  const handleBatchStatus = (newStatus) => {
    try {
      selectedRowKeys.forEach((id) => {
        const record = productList.find((item) => item.id === id);
        if (record && record.status !== newStatus) {
          services.good.toggleStatus(id);
        }
      });
      const label = newStatus === 'on' ? '上架' : '下架';
      message.success(`已批量${label} ${selectedRowKeys.length} 件商品`);
      setSelectedRowKeys([]);
      refresh();
    } catch (err) {
      message.error('批量操作失败');
    }
  };

  // 批量删除
  const handleBatchDelete = () => {
    const selectedRecords = productList.filter((item) => selectedRowKeys.includes(item.id));
    const names = selectedRecords.map((r) => r.name).join('、');
    confirmDelete({
      title: '批量删除',
      content: `确定要删除以下 ${selectedRowKeys.length} 件商品吗？此操作不可撤销。\n${names}`,
      onOk: () => {
        try {
          selectedRowKeys.forEach((id) => services.good.deleteGood(id));
          message.success(`已删除 ${selectedRowKeys.length} 件商品`);
          setSelectedRowKeys([]);
          refresh();
        } catch (err) {
          message.error('批量删除失败');
        }
      },
    });
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: (keys) => setSelectedRowKeys(keys),
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
    {
      title: '名称',
      dataIndex: 'name',
      ellipsis: true,
      render: (text) => {
        if (!text) return '—';
        const display = text.length > 12 ? text.slice(0, 12) + '…' : text;
        return text.length > 12 ? (
          <Tooltip title={text}>{display}</Tooltip>
        ) : (
          display
        );
      },
    },
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
          <Button
            type="link"
            danger
            icon={<DeleteOutlined aria-hidden="true" />}
            loading={loadingId === record.id}
            onClick={() => handleDelete(record.id)}
            aria-label={`删除 ${record.name}`}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  const customEmpty = (
    <Empty description="暂无商品，点击右上角新增第一个商品" />
  );

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>商品管理</h2>
        <Button type="primary" icon={<PlusOutlined aria-hidden="true" />} onClick={openCreate}>
          添加商品
        </Button>
      </div>

      {/* 搜索与筛选栏 */}
      <Row gutter={12} style={{ marginBottom: 16 }} align="middle">
        <Col>
          <Input.Search
            placeholder="搜索商品名称"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            onSearch={() => {}}
            style={{ width: 220 }}
            allowClear
          />
        </Col>
        <Col>
          <Select
            value={filterCategory}
            onChange={(val) => setFilterCategory(val)}
            options={categoryOptions}
            style={{ width: 160 }}
          />
        </Col>
        <Col>
          <Select
            value={filterStatus}
            onChange={(val) => setFilterStatus(val)}
            options={STATUS_FILTER_OPTIONS}
            style={{ width: 120 }}
          />
        </Col>
        <Col>
          <Button onClick={handleReset}>重置</Button>
        </Col>
      </Row>

      {/* 批量操作提示条 */}
      {selectedRowKeys.length > 0 && (
        <div
          style={{
            background: '#e6f4ff',
            padding: '8px 16px',
            marginBottom: 16,
            borderRadius: 6,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span>已选 {selectedRowKeys.length} 件商品</span>
          <Space>
            <Button size="small" onClick={() => handleBatchStatus('on')}>批量上架</Button>
            <Button size="small" onClick={() => handleBatchStatus('off')}>批量下架</Button>
            <Button size="small" danger onClick={handleBatchDelete}>批量删除</Button>
          </Space>
        </div>
      )}

      <Table
        rowKey="id"
        rowSelection={rowSelection}
        columns={columns}
        dataSource={displayList}
        loading={loading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '50'],
          showTotal: (t) => `共 ${t} 条`,
        }}
        locale={{ emptyText: customEmpty }}
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
          <Form.Item name="img" label="商品图片" rules={[{ required: true, message: '请上传商品图片' }]}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Upload
                accept="image/*"
                showUploadList={false}
                customRequest={async ({ file, onSuccess, onError }) => {
                  setUploading(true);
                  try {
                    const url = await uploadFile(file);
                    form.setFieldsValue({ img: url });
                    setPreviewUrl(url);
                    setImgError(false);
                    onSuccess(url);
                    message.success('图片上传成功');
                  } catch (err) {
                    onError(err);
                    message.error(err.message || '图片上传失败');
                  } finally {
                    setUploading(false);
                  }
                }}
              >
                <Button icon={<UploadOutlined />} loading={uploading}>
                  上传到 OSS
                </Button>
              </Upload>
              <Input
                placeholder="或手动输入图片 URL"
                onChange={(e) => {
                  form.setFieldsValue({ img: e.target.value });
                  setPreviewUrl(e.target.value);
                  setImgError(false);
                }}
              />
            </Space>
          </Form.Item>
          {/* 图片实时预览区 */}
          <div style={{ marginBottom: 16 }}>
            {previewUrl ? (
              <div>
                <Image
                  src={previewUrl}
                  width={80}
                  height={80}
                  style={{ objectFit: 'cover', borderRadius: 4 }}
                  preview={false}
                  onError={() => setImgError(true)}
                />
                {imgError && (
                  <div style={{ color: '#ff4d4f', fontSize: 12, marginTop: 4 }}>
                    图片链接无效
                  </div>
                )}
              </div>
            ) : (
              <div
                style={{
                  width: 80,
                  height: 80,
                  background: '#f0f0f0',
                  borderRadius: 4,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <PictureOutlined style={{ fontSize: 24, color: '#bfbfbf' }} />
              </div>
            )}
          </div>
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
