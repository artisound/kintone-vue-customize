<template>
  <div>
    <full-calendar
      locale="ja"
      :events="fcEvents"
      @changeMonth="changeMonth"
      @eventClick="eventClick"
    ></full-calendar>

    <k-dialog
      v-if="dialog"
      :visible="dialog"
      @close="dialog = !dialog"
    >
      <template v-slot:header>{{ fcActiveEvent.title }}</template>
      <div :style="{
        display: 'flex',
      }">
        <div style="padding: 5px 10px;">
          <k-label text="メッセージ内容" />
          <div
            class="control-value-gaia"
            v-html="fcActiveEvent['メッセージ内容'].replace(/\n/g, '<br>')"
          ></div>

          <k-label text="取得するURL" />
          <k-radio-button
            :items="urlItems"
            v-model="analyticsTargetUri"
          />

          <k-button
            text="取得"
            type="normal"
            @click="getAnalytics(fcActiveEvent.start, fcActiveEvent.end)"
          />
        </div>

        <div style="padding: 5px 10px;">
        </div>
      </div>
      <!-- <template v-slot:footer>
        <k-button
          text="閉じる"
          @click="dialog = !dialog"
        />
      </template> -->
    </k-dialog>
  </div>
</template>

<script>
import { KintoneRestAPIClient } from "@kintone/rest-api-client";
import dayjs from 'dayjs';
import objectSupport from 'dayjs/plugin/objectSupport';
dayjs.extend(objectSupport);

const Client = new KintoneRestAPIClient()

export default {
  components: {
  },
  data() {
    return {
      dialog: false,
      today: dayjs().format('YYYY-MM-DD'),
      month: dayjs().month() + 1,
      event: {},
      fcEvents: [],

      fcActiveEvent: {},
      urlItems: [],
      analyticsTargetUri: '',
    }
  },

  watch: {
    dialog: function(aft) {
      if (!aft) {
        this.analyticsTargetUri = ''
        this.fcActiveEvent = {}
        this.urlItems = []
      }
    }
  },
  mounted: async function() {
    // .env
    console.log('.env', process.env.TEST)
    console.log(this.$ga.page('/'))
  },
  methods: {
    onSave() {
      alert('保存がクリックされました。');
    },

    getDeliRecordsInMonth: async function(month) {
      const firstDayOfMonth = dayjs({month: month - 1}).startOf('month')
      const lastDayOfMonth  = dayjs({month: month - 1}).endOf('month')

      const query = [
        `実績日 >= "${dayjs(firstDayOfMonth).format('YYYY-MM-DD')}"`,
        `実績日 <= "${dayjs(lastDayOfMonth).format('YYYY-MM-DD')}"`,
        `受信Box区分 in ("お知らせ")`
      ].join(' and ')

      try {
        const records = await Client.record.getAllRecords({
          app: 38, // 配信管理
          condition: query
        }).then(records => {
          const newRecords = []
          records.forEach(record => {
            const newRecord = {}

            for (const fieldCode in record) {
              newRecord[fieldCode] = record[fieldCode].value
            }

            // FullCalendar用パラメータ
            newRecord.title = newRecord['サービス区分']
            newRecord.start = newRecord['実績日']
            newRecord.end   = newRecord['実績日']
            newRecord.urls  = newRecord['メッセージ内容'].match(/https?:\/\/[-_.!~*\'()a-zA-Z0-9;\/?:\@&=+\$,%#\u3000-\u30FE\u4E00-\u9FA0\uFF01-\uFFE3]+/g)

            console.log(newRecord.urls)

            newRecords.push(newRecord)
          })
          return newRecords
        })

        return records
      } catch(error) {
        console.error(error)
      }
    },

    changeMonth: async function(start, end, current) {
      const thisMonth = dayjs(current).month() + 1
      console.log(thisMonth)
      this.fcEvents = await this.getDeliRecordsInMonth(thisMonth)
      console.log(this.fcEvents)
    },

    eventClick: function(event, jsEvent, pos) {
      this.dialog = true
      console.log(event)
      this.fcActiveEvent = event

      if (event.urls) {
        const urlItems = [];
        event.urls.forEach(url => urlItems.push({
          label: url,
          value: url.replace(process.env.SITE_URL, ''),
        }))
        this.urlItems = event.urls
      }
    },

    getAnalytics: async function(startDate, endDate) {

      // await this.$gapi.request({
      //   path: process.env.ANALYTICS_REPORT_URL,
      //   method: 'POST',
      //   body: {
      //     reportRequests: [
      //       {
      //         viewId: 241577285,
      //         dateRanges: [{ startDate: startDate, endDate: endDate }],
      //         metrics: [
      //           { expression: 'ga:pageviews' }
      //         ],
      //         dimensions: [
      //           { name: 'ga:pagePath' }
      //         ],
      //         dimensionFilterClauses: [{
      //           filters: [{
      //             dimensionName: 'ga:pagePath',
      //             expressions: [ '/' ]
      //           }]
      //         }],
      //         orderBys: [{
      //           fieldName: "ga:pageviews",
      //           sortOrder: "DESCENDING"
      //         }]
      //       }
      //     ]
      //   },
      //   headers: { 'content-Type': 'application/json' }
      // }).then(res => {
      //   if (res.status === 200) {
      //     console.log(res.result)
      //     return {
      //       result: true,
      //       data: res.result.reports[0].data.rows
      //     }
      //   } else {
      //     return {
      //       result: false,
      //       code: res.code,
      //       data: []
      //     }
      //   }
      // })

    }
  }
}
</script>


<style>
#app {
  height: 50px;
  padding: 10px;
}

.k-dialog-wrapper {
  max-width: 90vw;
  min-width: 300px;
}

.control-value-gaia {
  max-width: 532px;
  border-color: #d8d8d8;
  border-width: 1px;
  border-style: solid;
  padding: 4px 8px;
  font-size: 14px;
  overflow: hidden;
  min-height: 21px;
  color: #333;
  white-space: pre-wrap;
  background-color: #eee;
  word-wrap: break-word;
}
</style>