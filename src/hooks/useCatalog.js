import { useContext, useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import goodService from '../services/goodService';
import categoryService from '../services/categoryService';
import orderService from '../services/orderService';
import { ServiceContext } from '../contexts/ServiceContext';

function useGoodVersion() {
  return useSyncExternalStore(
    (cb) => goodService.subscribe(cb),
    () => goodService.getVersion(),
    () => goodService.getVersion(),
  );
}

function useCategoryVersion() {
  return useSyncExternalStore(
    (cb) => categoryService.subscribe(cb),
    () => categoryService.getVersion(),
    () => categoryService.getVersion(),
  );
}

export function useGoodList(filters = {}) {
  const version = useGoodVersion();
  return useMemo(
    () => goodService.getGoodList(filters),
    [version, filters.status, filters.categoryId, filters.hot, filters.keyword],
  );
}

export function useGoodById(id) {
  const version = useGoodVersion();
  return useMemo(() => goodService.getGoodById(id), [version, id]);
}

export function useCategoryList() {
  const version = useCategoryVersion();
  return useMemo(() => categoryService.getCategoryList(), [version]);
}

export function useCategoryById(id) {
  const version = useCategoryVersion();
  return useMemo(
    () => (id != null ? categoryService.getCategoryById(id) : null),
    [version, id],
  );
}

function useOrderVersion() {
  return useSyncExternalStore(
    (cb) => orderService.subscribe(cb),
    () => orderService.getVersion(),
    () => orderService.getVersion(),
  );
}

export function useOrderById(id) {
  const version = useOrderVersion();
  const { ordersTick } = useContext(ServiceContext) ?? {};
  void version;
  void ordersTick;
  return orderService.getOrderById(id);
}

export function useOrdersByUserId(userId) {
  const version = useOrderVersion();
  const { ordersTick } = useContext(ServiceContext) ?? {};
  void version;
  void ordersTick;
  return userId ? orderService.getOrdersByUserId(userId) : [];
}

export function useAllOrders() {
  const version = useOrderVersion();
  const { ordersTick } = useContext(ServiceContext) ?? {};
  void version;
  void ordersTick;
  return orderService.getAllOrders();
}

/** 用户端订单列表：本地 state + ordersTick 同步，确保跨标签/轮询后立即重渲染 */
export function useSyncedUserOrders(userId) {
  const version = useOrderVersion();
  const { ordersTick } = useContext(ServiceContext) ?? {};
  const [orders, setOrders] = useState(() =>
    (userId ? orderService.getOrdersByUserId(userId) : []),
  );

  useEffect(() => {
    setOrders(userId ? [...orderService.getOrdersByUserId(userId)] : []);
  }, [userId, ordersTick, version]);

  return orders;
}

/** 用户端订单详情：本地 state + ordersTick 同步 */
export function useSyncedOrderById(id) {
  const version = useOrderVersion();
  const { ordersTick } = useContext(ServiceContext) ?? {};
  const [order, setOrder] = useState(() => orderService.getOrderById(id));

  useEffect(() => {
    setOrder(orderService.getOrderById(id));
  }, [id, ordersTick, version]);

  return order;
}
