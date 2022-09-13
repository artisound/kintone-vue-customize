<template>
  <div>
    <k-spinner
      type="ring"
      :visible="loading"
    />
    <full-calendar
      locale="ja"
      :events="events"
      @changeMonth="changeMonth"
      @eventClick="eventClick"
    />
    <k-dialog
      v-if="dialog"
      :visible="dialog"
      @close="dialog = !dialog"
    >
      <template v-slot:header>{{ fcActiveEvent.title }}</template>
      <div
        :style="{
          padding: '0 10px',
          margin: '5px 0',
        }"
      >{{dayjs(fcActiveEvent.end).format('YYYY年M月D日')}}</div>
      <div :style="{
        display: 'flex',
      }">
        <div
          :style="{
            padding: '5px 10px',
          }"
        >
          <k-label text="メッセージ内容" />
          <div
            class="control-value-gaia"
            v-html="fcActiveEvent['メッセージ内容'].replace(/\n/g, '<br>')"
          ></div>
        </div>

        <div
          :style="{
            width: '500px',
            padding: '5px 10px'
          }"
        >
          <div style="">
            <k-label text="取得するURL" />
            <k-radio-button
              :items="urlItems"
              v-model="selectedUri"
              @change="getAnalytics(fcActiveEvent.start, fcActiveEvent.end, selectedUri)"
            />
          </div>

          <div
            :style="{
              display: 'flex',
              flexDirection: 'column',
              width: '100%',
            }
          ">

            <div
              :style="{
                borderTop: '1px solid #eee',
                marginTop: '10px',
                paddingTop: '10px',
                justifyContent: 'space-between',
                display: 'flex',
                width: '100%'
              }"
              v-if="report!==null"
            >
              <div style="padding: 0 10px;">
                <span>配信数：</span>
                <strong>{{fcActiveEvent['配信対象人数']}} 件</strong>
              </div>
              <div style="padding: 0 10px;">
                <span>アクセス数(PV)：</span>
                <strong>{{report}} 件</strong>
              </div>
            </div>

            <vc-donut
              v-if="report || report == 0"
              unit="px"
              style="margin-top:20px;"
              background="white"
              foreground="#eee"
              ring-thickness="20"
              :has-legend="false"
              :size="200"
              :total="fcActiveEvent['配信対象人数']"
              :sections="[{label: selectedUri, value: Number(report) || 0, color: '#3ba0e5'}]"
              :thickness="30"
              :start-angle="0"
              :auto-adjust-text-size="true"
            >
              <strong style="font-size:23px;">{{pvPerDelivery}} %</strong>
            </vc-donut>
          </div>
        </div>
      </div>
      <template v-slot:footer>
      </template>
    </k-dialog>
  </div>
</template>

<script>
import { KintoneRestAPIClient } from "@kintone/rest-api-client";
import dayjs from 'dayjs';
import axios from 'axios';
import objectSupport from 'dayjs/plugin/objectSupport';

dayjs.extend(objectSupport);
axios.defaults.headers.common['Access-Control-Allow-Origin'] = '*'
const Client = new KintoneRestAPIClient()

export default {
  components: {
  },
  data() {
    return {
      loading: true,
      dialog: false,
      today: dayjs().format('YYYY-MM-DD'),
      month: dayjs().month() + 1,
      event: {},
      events: [],

      fcActiveEvent: {},
      urlItems: [],
      selectedUri: '',
      report: null
    }
  },

  watch: {
    dialog: function(aft) {
      if (!aft) {
        this.selectedUri = ''
        this.fcActiveEvent = {}
        this.urlItems = []
        this.report = null
      }
    },
    selectedUri: function(a) {
      console.log(a)
    }
  },
  mounted: async function() {
    this.loading = false
  },
  computed: {
    pvPerDelivery: function() {
      if (this.fcActiveEvent['配信対象人数'] && this.report) {
        const target = Number(this.fcActiveEvent['配信対象人数'])
        const report = Number(this.report)
        const per    = (report / target) * 100
        return per.toFixed(1)
      } else {
        return 0
      }
    }
  },
  methods: {
    handleDateClick: function(arg) {
      consoe.log(arg)
    },
    dayjs(date) {
      return date ? dayjs(date) : dayjs()
    },

    onSave() {
      alert('保存がクリックされました。');
    },

    getDeliRecordsInMonth: async function(start, end) {
      const condition = kintone.app.getQueryCondition()
      const query = [
        `実績日 >= "${dayjs(start).format('YYYY-MM-DD')}"`,
        `実績日 <= "${dayjs(end).format('YYYY-MM-DD')}"`,
      ].join(' and ')

      console.log(query)

      try {
        const records = await Client.record.getAllRecords({
          app: 38, // 配信管理
          condition: [query, condition].join(' and ')
        }).then(records => {
          const newRecords = []
          records.forEach(record => {
            const newRecord = {}

            for (const fieldCode in record) {
              newRecord[fieldCode] = record[fieldCode].value
            }

            const urls = newRecord['メッセージ内容'].match(/https?:\/\/(minna|supporter)\.[-_.!~*\'()a-zA-Z0-9;\[\]\/?:\@&=+\$,%#\u3000-\u30FE\u4E00-\u9FA0\uFF01-\uFFE3]+/g)
            if (urls) {
              newRecord.urls  = []
              urls.forEach(url => {
                const uri = url.replace(process.env.VUE_APP_SITE_URL, '')
                const dcodedUri = decodeURI(uri.replace(/\#61\;|\&\#61\;/g, '=').replace(/\&amp\;/g, '&')).replace(/[\x20\u3000]/g, ' ')
                newRecord.urls.push(process.env.VUE_APP_SITE_URL+dcodedUri)
              })

              // FullCalendar用パラメータ
              newRecord.title = newRecord['メッセージ内容'].indexOf('求人情報') > -1 ? '求人情報' : newRecord['サービス区分']
              newRecord.start = newRecord['実績日']
              newRecord.end   = newRecord['実績日']

              newRecords.push(newRecord)
            }
          })
          return newRecords
        })

        return records
      } catch(error) {
        console.error(error)
      }

      this.loading = false
    },

    changeMonth: async function(start, end, current) {
      // fcAPI.remove()
      // const events = await this.getDeliRecordsInMonth(start, end)
      // events.forEach(ev => fcAPI.eventSource.addEventSource(ev))
      this.events = []
      this.events = await this.getDeliRecordsInMonth(start, end)
      console.log(this.events)
    },

    eventClick: async function(event, jsEvent, pos) {
      this.dialog = true
      console.log(event)
      this.fcActiveEvent = event

      if (event.urls) {
        const urlItems = [];
        event.urls.forEach(url => urlItems.push({
          label: url,
          value: decodeURI(url.replace(process.env.VUE_APP_SITE_URL, '')),
        }))
        this.urlItems = urlItems
      }
    },

    getAnalytics: async function(startDate, endDate, uri) {
      console.log(startDate,endDate, uri)
      this.loading = true
      try {
        const reports = await axios.post(process.env.VUE_APP_ANALYTICS_API_URL, [
          {
            viewId: '255081081', // ビュー ID を指定する
            dateRanges: [ // 過去30日を集計対象とする
              { startDate: startDate, endDate: endDate }
            ],
            dimensions: [ // ページパスをディメンションにする
              { name: 'ga:pagePath' }
            ],
            metrics: [ // 利用する指標
              { expression: 'ga:pageviews' }  // ページビューを指標として利用
            ],
            orderBys: { // ソート順
              fieldName: 'ga:pageviews', // ページビューでソート
              sortOrder: 'DESCENDING'    // 降順でソートする設定
            },
            dimensionFilterClauses: {
              filters: [
                {
                  operator: 'EXACT',  // 完全一致
                  dimensionName: 'ga:pagePath',
                  expressions: uri
                }
              ]
            }
          }
        ]).then(report => report.data.reports[0])
        this.loading = false
        console.log(reports.data)
        if (reports.data.rows) {
          const metrics = reports.data.rows[0].metrics
          if (metrics.length) this.report = metrics[0].values[0]
        } else {
          throw 'no data'
        }
      } catch(e) {
        console.error(e)
        this.loading = false
        this.report = 0
      }
    }
  }
}
</script>

<style>
#app {
  height: 50px;
  padding: 10px;
}

.k-dialog-body {
  height: max-content !important;
  min-height: 400px;
}

.k-dialog-wrapper {
  max-width: 90vw;
  min-width: 300px !important;
}

.k-dialog-footer {
  display: none !important;
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
.comp-full-calendar {
  max-width: 100% !important;
}
</style>