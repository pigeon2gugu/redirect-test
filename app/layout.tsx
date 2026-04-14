import "./globals.css";

export const metadata = {
  title: "redirect-test",
  description: "Minimal cacheComponents redirect repro",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
