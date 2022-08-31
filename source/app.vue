<template>
  <div>
    <k-button
      text="保存"
      type="submit"
      @click="onSave"
    />
    <Sample />
  </div>
</template>

<script>
import Sample from './components/Sample.vue';
import dayjs from 'dayjs';

export default {
  components: {
    Sample
  },
  data() {
    return {
      event: {},
    }
  },
  mounted: function() {
    // dayjs
    console.log('dayjs', dayjs().format('YYYY-MM-DD'))

    // kintone イベント
    console.log('イベント', this.event)

    // .env
    console.log('.env', process.env.TEST)
  },
  watch: {
    event: {
      deep: true,
      handler: function(aft) {
        this.event = aft
        console.log(this.event)
      },
    }
  },
  methods: {
    onSave() {
      alert('保存がクリックされました。');
    },
  }
}
</script>


<style>
#app {
  height: 50px;
  padding: 10px;
}
</style>