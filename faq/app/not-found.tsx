import Link from "next/link";

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
      }}
    >
      <h1>404</h1>
      <p>Halaman tidak ditemukan.</p>

      <Link href="/">Kembali</Link>
    </div>
  );
}
