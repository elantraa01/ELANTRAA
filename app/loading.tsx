import { LogoShimmer } from "@/components/ui/LuxurySkeleton";

export default function RootLoading() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <LogoShimmer size="lg" />
    </div>
  );
}
