<script>
export let data;
</script>

<div class="flex font-alcxTitles">
  <img src="{data.icon}" class="mr-4" />
  <div class="flex justify-center items-center">
    <div>
      {data.strategyName.toUpperCase()}
    </div>
    <!--    <div class="text-sm text-lightgrey10">-->
    <!--      {data.strategyFullName}-->
    <!--    </div>-->
  </div>
</div>
