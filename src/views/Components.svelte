<script>
/*
 * View to display all available element components
 * */
import Button from '../components/elements/Button.svelte';
</script>

<div>
  <p>Labels</p>

  <hr />

  <h1>Buttons</h1>
  <p>Button with default values and a click listener</p>
  <Button on:clicked="{() => alert('clicked')}" />
  <p>Button with filled props and a click listener</p>
  <Button
    label="A very long custom label"
    borderColor="blue2"
    borderSize="2"
    hoverColor="blue1"
    textColor="red1"
    on:clicked="{() => alert('clicked second button')}"
  />
  <p>Disabled button</p>
  <Button
    borderColor="red1"
    backgroundColor="red1"
    disabled="{true}"
    on:clicked="{() => alert('impossible alert')}"
  />
  <hr />

  <p>Input Fields</p>

  <hr />

  <p>Input Groups</p>
</div>
