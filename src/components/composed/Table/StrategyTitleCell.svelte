<script>
  export let icon = '';
  export let strategyName;
</script>

<div class="flex font-alcxTitles">
  <img src="{icon}" class="mr-4" />
  <div class="flex justify-center items-center">
    <div>
      {strategyName.toUpperCase()}
    </div>
    <!--    <div class="text-sm text-lightgrey10">-->
    <!--      {data.strategyFullName}-->
    <!--    </div>-->
  </div>
</div>
