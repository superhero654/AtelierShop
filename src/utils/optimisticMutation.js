/**
 * 乐观更新：先改 UI/缓存，后台请求，失败回滚
 */
export async function optimisticMutation({
  apply,
  rollback,
  request,
  onSuccess,
  onError,
}) {
  apply();
  try {
    const result = await request();
    onSuccess?.(result);
    return result;
  } catch (err) {
    rollback();
    onError?.(err);
    throw err;
  }
}
