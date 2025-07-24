import { useSignal } from "@preact/signals";
import Counter from "../islands/Counter.tsx";
import DrawingBoard from "../islands/DrawingBoard.tsx";

export default function Home() {
  const count = useSignal(3);
  return (
    <div class="mx-auto bg-[#86efac]">
      <div class="max-w-screen-md mx-auto flex flex-col items-center justify-center">
        <img
          class="my-6"
          src="/logo.svg"
          width="128"
          height="128"
          alt="the Fresh logo: a sliced lemon dripping with juice"
        />
        <h1 class="text-4xl font-bold">Welcome to Fresh</h1>
        <p class="my-4">
          Try updating this message in the
          <code class="mx-2">./routes/index.tsx</code> file, and refresh.
        </p>
        <Counter count={count} />
      </div>

      <div class="w-full h-full flex items-center justify-center bg-red-400">

        <DrawingBoard />


      </div>
    </div>
  );
}
