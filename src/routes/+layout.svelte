<script>
  import ratIcon from "../rat-icon.svg";
  import rat from "../rat.jpg";
  import "../app.css";
</script>

<svelte:head>
  <link rel="icon" href={ratIcon} />
  <meta property="og:image" content={rat} />
</svelte:head>
<slot />
