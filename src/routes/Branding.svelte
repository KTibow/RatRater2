<script lang="ts">
  const name = "RatRater 2";
  const description =
    "Analyzes .jar files for known signs of infostealers (rats), common among the Hypixel Skyblock community.";
  const github = "https://github.com/KTibow/RatRater2";
</script>

{#snippet outlink(href: string, text: string)}
  <a {href} class="outlink">{text}</a>
{/snippet}
<div class="branding">
  <div class="row">
    <img src="https://ktibow.github.io/favicon.svg" alt="KTibow's" width="16" height="16" />
    <h1>{name}</h1>
    <div style:flex-grow="1"></div>
    {@render outlink(github, "GitHub")}
    {@render outlink("https://discord.gg/sRzVYM9b47", "Discord")}
  </div>
  <p>{description}</p>
</div>

<style>
  .branding {
    --transition: all 500ms var(--m3-easing);
    display: flex;
    flex-direction: column;
    justify-content: center;
    min-height: 2.5rem;
    padding-inline: 1.5rem;
    border-radius: 1.75rem;
    background-color: rgb(var(--m3-scheme-primary-container));
    color: rgb(var(--m3-scheme-on-primary-container));
    transition: var(--transition);
    overflow: hidden;

    &:not(:hover) {
      .row {
        margin-top: 0.5rem;
        margin-bottom: 0.5rem;
        img {
          width: 0;
          height: 0;
          opacity: 0;
        }
        h1 {
          margin-left: 0;
        }
        .outlink {
          width: 0;
          padding-inline: 0;
          margin-left: 0;
          opacity: 0;
        }
      }
      p {
        width: 0;
        height: 0;
      }
    }
    &:hover {
      .row {
        margin-top: 1.5rem;
      }
      p {
        margin-bottom: 1.5rem;
      }
    }
    .row {
      display: flex;
      align-items: center;
      transition: var(--transition);

      img {
        width: 1rem;
        height: 1rem;
        border-radius: 1rem;
        background-color: rgb(var(--m3-scheme-background));
        transition: var(--transition);
      }
      h1 {
        font-weight: bold;
        font-size: 1rem;
        margin-left: 0.5rem;
        transition: var(--transition);
      }
      .outlink {
        display: flex;
        width: calc-size(auto, size);
        padding-inline: 0.5rem;
        margin-left: 0.5rem;
        border-radius: 1.5rem;
        overflow: hidden;
        background-color: rgb(var(--m3-scheme-primary));
        color: rgb(var(--m3-scheme-on-primary)) !important;
        text-decoration: none !important;
        transition: var(--transition);
      }
    }
    p {
      width: calc-size(auto, size);
      height: 1.5rem;
      overflow: hidden;
      white-space: nowrap;
      transition: var(--transition);
    }
  }
</style>
