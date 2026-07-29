export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <h1 className="text-4xl font-bold">Invoice Extractor</h1>
      <p className="text-grey-500">
        Upload an invoice, get structured data. Build in progress.
      </p>
      <UploadForm />
    </main>
  );
}
// i am putting a html form in this page and let user upload PDF/PNG/JPG file.
function UploadForm() {
  return (
    <form action="/api/upload" method="post" encType="multipart/form-data">
      <input type="file" name="file" accept=".pdf,.png,.jpg,.jpeg" />
      <button type="submit">Upload</button>
    </form>
  );
}
