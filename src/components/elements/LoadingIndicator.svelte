<script>
import * as LottiePlayer from '@lottiefiles/lottie-player';
import backgroundLoading from '../../stores/backgroundLoading';
</script>

<div class="inline-block relative w-full">
  <div
    class="h-8 px-3 py-1 flex items-center text-opacity-50 select-none font-alcxTitles text-xs uppercase rounded overflow-hidden border border-grey5 text-white2 bg-grey10 hover:bg-grey1"
  >
    <lottie-player
      src="images/lotties/AlchemixSpinning.json"
      style="width: 1.2rem; height: 1.2rem;"
      autoplay
      loop></lottie-player>
    <p class="ml-2">
      {$backgroundLoading.message}
    </p>
  </div>
</div>
