export function imageSrcSet(url?: string): string | undefined {
  if (!url || !url.includes('/image/upload/')) return undefined;
  const sizes = [480, 768, 1200];
  return sizes.map(width => {
    const marker = '/image/upload/';
    const uploadIndex = url.indexOf(marker) + marker.length;
    const tail = url.slice(uploadIndex);
    const firstSegment = tail.slice(0, tail.indexOf('/') < 0 ? tail.length : tail.indexOf('/'));
    const hasTransform = /^(?:w_|h_|f_|q_|c_|g_|ar_|dpr_|e_|fl_|b_|bo_|r_|t_|a_|l_|u_|if_|ki_|so_|du_|vc_|ac_|af_|br_|cs_|d_|dn_|eo_|fps_|pg_|sp_|tr_|z_|x_|y_|$)/.test(firstSegment) || firstSegment.includes(',');
    const rest = hasTransform ? tail.slice(firstSegment.length + 1) : tail;
    const variant = `${url.slice(0, uploadIndex)}w_${width},c_limit,f_auto,q_auto:eco/${rest}`;
    return `${variant} ${width}w`;
  }).join(', ');
}
