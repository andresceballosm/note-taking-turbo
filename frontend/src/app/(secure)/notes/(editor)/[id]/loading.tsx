export default function Loading() {
  return (
    <div className="flex h-screen items-center justify-center bg-[#FAF1E3]">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#88642A] border-t-transparent" />
        <p className="font-['Inter'] text-[16px] font-normal text-[#88642A]">
          Loading note...
        </p>
      </div>
    </div>
  );
}
