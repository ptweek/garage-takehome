import ClientHome from "./clientPage";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <div className='bg-white text-black text-4xl p-2'>Garage Webpage</div>
      <ClientHome />
    </div>
  );
}
