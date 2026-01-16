import ClientHome from "./clientPage";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <div className='p-3'><img
        style={{ width: '200px', height: '50px' }}
        src="garage-logo.svg"
      /></div>
      <ClientHome />
    </div>
  );
}
