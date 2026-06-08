// src/utils/confirmDelete.jsx
import { Modal } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';

let timerId = null;

export default function confirmDelete({ title, content, onOk }) {
  let countdown = 3;

  const modalInstance = Modal.confirm({
    title,
    icon: <ExclamationCircleOutlined />,
    content,
    okText: `确认删除 (${countdown})`,
    cancelText: '取消',
    okButtonProps: { danger: true, disabled: true },
    centered: true,
    onOk: () => {
      if (timerId) {
        clearInterval(timerId);
        timerId = null;
      }
      onOk();
    },
    onCancel: () => {
      if (timerId) {
        clearInterval(timerId);
        timerId = null;
      }
    },
  });

  const updateButton = () => {
    countdown -= 1;
    if (countdown > 0) {
      modalInstance.update({
        okText: `确认删除 (${countdown})`,
        okButtonProps: { danger: true, disabled: true },
      });
    } else {
      clearInterval(timerId);
      timerId = null;
      modalInstance.update({
        okText: '确认删除',
        okButtonProps: { danger: true, disabled: false },
      });
    }
  };

  timerId = setInterval(updateButton, 1000);
}
