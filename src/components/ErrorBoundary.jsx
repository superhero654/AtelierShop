// src/components/ErrorBoundary.jsx
import { Component } from 'react';
import { Result, Button, Space } from 'antd';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoProducts = () => {
    window.location.href = '/admin/products';
  };

  render() {
    if (this.state.hasError) {
      return (
        <Result
          status="error"
          title="页面出错了"
          subTitle={this.state.error?.message || '发生未知错误'}
          extra={
            <Space>
              <Button type="primary" onClick={this.handleReload}>
                刷新页面
              </Button>
              <Button onClick={this.handleGoProducts}>
                回到商品管理
              </Button>
            </Space>
          }
        />
      );
    }

    return this.props.children;
  }
}
