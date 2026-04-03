/**
 * 将大厅/表单里的打手 ID 规范为与后端 orders.player_id、users.player_profile_id 一致的字符串（数字主键）。
 * 兼容历史演示数据里的 p1、p2 等形式。
 */
export function normalizePlayerProfileId(raw) {
    if (raw == null)
        return '';
    const t = String(raw).trim();
    if (!t)
        return '';
    if (/^p\d+$/i.test(t))
        return t.substring(1);
    return t;
}
