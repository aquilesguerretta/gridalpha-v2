export function Divider() {
  return (
    <div
      aria-hidden
      className="mx-auto"
      style={{
        width: '60%',
        height: '1px',
        margin: '120px auto',
        background:
          'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.06) 50%, rgba(255,255,255,0) 100%)',
      }}
    />
  );
}
