let _kv: Deno.Kv | null = null;

export async function getKv(): Promise<Deno.Kv> {
  if (!_kv) {
    _kv = await Deno.openKv();
  }
  return _kv;
}

export function setKv(kv: Deno.Kv): void {
  _kv = kv;
}
