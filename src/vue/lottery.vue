<template>
  <div class="columns is-centered">
    <div class="column is-half">
      <div class="hero is-info box">
        <div class="hero-body">
          <p class="title">抽選するやつ</p>
        </div>
      </div>

      <div class="box">
        <div class="tabs">
          <ul>
            <li
              v-bind:class="{
                'is-active': currentLotteryType == lotteryType.number,
              }"
              v-on:click="currentLotteryType = lotteryType.number"
            >
              <a>数字</a>
            </li>
            <li
              v-bind:class="{
                'is-active': currentLotteryType == lotteryType.text,
              }"
              v-on:click="currentLotteryType = lotteryType.text"
            >
              <a>テキスト</a>
            </li>
          </ul>
        </div>

        <div class="field">
          <label class="label">重複</label>
          <div class="control">
            <label class="radio">
              <input
                type="radio"
                name="dup0"
                v-bind:value="true"
                v-model="isDuplicationAllowed"
              />
              あり
            </label>
            <label class="radio">
              <input
                type="radio"
                name="dup0"
                v-bind:value="false"
                v-model="isDuplicationAllowed"
              />
              なし
            </label>
          </div>
        </div>

        <div class="field">
          <label class="label">抽選数</label>
          <div class="control">
            <input
              class="input"
              type="number"
              v-bind:class="{ 'is-danger': validationResult.lotteryCount }"
              v-bind:min="lotteryCountMinValue"
              v-bind:max="lotteryCountMaxValue"
              v-model.number="lotteryCount"
            />
          </div>
        </div>

        <div class="field" v-show="currentLotteryType == lotteryType.number">
          <label class="label">最小値</label>
          <div class="control">
            <input
              class="input"
              type="number"
              v-bind:class="{ 'is-danger': validationResult.numberMinMax }"
              v-bind:min="numberMinValue"
              v-bind:max="numberMaxValue"
              v-model.number="numberMin"
            />
          </div>
        </div>

        <div class="field" v-show="currentLotteryType == lotteryType.number">
          <label class="label">最大値</label>
          <div class="control">
            <input
              class="input"
              type="number"
              v-bind:class="{ 'is-danger': validationResult.numberMinMax }"
              v-bind:min="numberMinValue"
              v-bind:max="numberMaxValue"
              v-model.number="numberMax"
            />
          </div>
        </div>

        <div class="field" v-show="currentLotteryType == lotteryType.text">
          <label class="label">テキスト（空の行は無視されます）</label>
          <div class="control">
            <textarea
              class="textarea"
              v-bind:class="{ 'is-danger': validationResult.lotteryText }"
              v-model="lotteryText"
              rows="10"
            />
          </div>
          <div class="file is-boxed mt-2">
            <label class="file-label">
              <input
                id="fileInput"
                class="file-input"
                type="file"
                v-on:change="inputFileSelected"
                multiple
              />
              <span
                class="file-cta"
                @dragover.prevent="dragOver"
                @dragleave="dragLeave"
                @drop.stop="drop"
              >
                <span class="file-label has-text-centered">
                  ここにファイルをドロップ<br />または<br />クリックしてファイルを選択
                </span>
              </span>
            </label>
          </div>
        </div>

        <div class="mt-5 has-text-danger">
          <p v-for="message in validationMessage" v-bind:key="message">
            {{ message }}
          </p>
        </div>

        <div class="mt-5">
          <button
            class="button is-info is-fullwidth"
            v-on:click="draw"
            v-bind:disabled="!isDrawButtonEnabled"
          >
            抽選する
          </button>
        </div>
      </div>

      <div class="box">
        <table id="lotteryResult" class="table">
          <thead>
            <th>抽選回数</th>
            <th>当選</th>
          </thead>
          <tbody>
            <tr v-for="(hitItem, index) in hitItems" v-bind:key="index">
              <th class="has-text-right">{{ index + 1 }}</th>
              <td
                v-bind:class="{
                  'has-text-right': currentLotteryType == lotteryType.number,
                }"
              >
                {{ hitItem }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div>
        <p class="has-text-centered">&copy;2021 <a href="https://twitter.com/rgx_6">@rgx_6</a></p>
      </div>
    </div>
  </div>
</template>

<script>
import Vue from "vue";
import { getRandomNumberArray } from "../js/random";
import Encoding from "/node_modules/encoding-japanese/encoding.min.js";

export default Vue.extend({
  data: function () {
    return {
      currentLotteryType: 0,
      isDuplicationAllowed: false,
      lotteryCount: 1,
      numberMin: 1,
      numberMax: 10,
      hitItems: [],
      lotteryText: "",
      isDragOver: false,
      validationResult: {},
      validationMessage: [],
    };
  },
  computed: {
    lotteryType: function () {
      return {
        number: 0,
        text: 1,
      };
    },
    lotteryCountMinValue: () => 1,
    lotteryCountMaxValue: () => 10000,
    numberMinValue: () => -999999999,
    numberMaxValue: () => 999999999,
    rangeMaxWhenDuplicationAllowed: () => 100000,
    maxFileSize: () => 10 * 1024 * 1024,
    isDrawButtonEnabled: function () {
      return (
        this.validationMessage == null || this.validationMessage.length == 0
      );
    },
    numberRange: function () {
      return Math.max(0, this.numberMax - this.numberMin + 1);
    },
    textItemCount: function () {
      return this.getNotEmptyLines(this.lotteryText).length;
    },
  },
  watch: {
    currentLotteryType: function (value) {
      this.validate();
    },
    isDuplicationAllowed: function (value) {
      this.validate();
    },
    lotteryCount: function (value) {
      this.lotteryCount = this.getValueInRange(
        value,
        this.lotteryCountMinValue,
        this.lotteryCountMaxValue
      );
      this.validate();
    },
    numberMin: function (value) {
      this.numberMin = this.getValueInRange(
        value,
        this.numberMinValue,
        this.numberMaxValue
      );
      this.validate();
    },
    numberMax: function (value) {
      this.numberMax = this.getValueInRange(
        value,
        this.numberMinValue,
        this.numberMaxValue
      );
      this.validate();
    },
    lotteryText: function (value) {
      this.validate();
    },
  },
  methods: {
    validate: function () {
      this.validationResult = {};
      this.validationMessage = [];

      if (
        this.currentLotteryType == this.lotteryType.number &&
        !this.isDuplicationAllowed &&
        this.numberRange < this.lotteryCount
      ) {
        this.validationResult.lotteryCount = true;
        this.validationMessage.push(
          "抽選数は最小値～最大値の幅以内で入力してください。"
        );
      } else if (
        this.currentLotteryType == this.lotteryType.text &&
        !this.isDuplicationAllowed &&
        this.textItemCount < this.lotteryCount
      ) {
        this.validationResult.lotteryCount = true;
        this.validationMessage.push(
          "抽選数はテキストの行数以内で入力してください。"
        );
      }

      if (
        this.currentLotteryType == this.lotteryType.number &&
        this.numberRange < 2
      ) {
        this.validationResult.numberMinMax = true;
        this.validationMessage.push(
          "最小値より最大値が大きくなるように入力してください。"
        );
      }

      if (
        this.currentLotteryType == this.lotteryType.text &&
        this.textItemCount < 2
      ) {
        this.validationResult.lotteryText = true;
        this.validationMessage.push("テキストは2行以上入力してください。");
      }

      if (
        this.currentLotteryType == this.lotteryType.number &&
        this.isDuplicationAllowed &&
        this.rangeMaxWhenDuplicationAllowed < this.numberRange
      ) {
        this.validationResult.numberMinMax = true;
        this.validationMessage.push(
          "重複ありの場合は最小値～最大値の幅を" +
            this.rangeMaxWhenDuplicationAllowed +
            "以内で入力してください。"
        );
      } else if (
        this.currentLotteryType == this.lotteryType.text &&
        this.isDuplicationAllowed &&
        this.rangeMaxWhenDuplicationAllowed < this.textItemCount
      ) {
        this.validationResult.lotteryCount = true;
        this.validationMessage.push(
          "重複ありの場合は抽選数はテキストを" +
            this.rangeMaxWhenDuplicationAllowed +
            "行以内で入力してください。"
        );
      }
    },
    draw: function () {
      if (this.currentLotteryType == this.lotteryType.number) {
        this.drawFromNumbers();
      } else if (this.currentLotteryType == this.lotteryType.text) {
        this.drawFromTexts();
      }

      document
        .getElementById("lotteryResult")
        .scrollIntoView({ behavior: "smooth" });
    },
    drawFromNumbers: function () {
      this.hitItems = getRandomNumberArray(
        this.numberMin,
        this.numberMax,
        this.lotteryCount,
        this.isDuplicationAllowed
      );
    },
    drawFromTexts: function () {
      const lines = this.getNotEmptyLines(this.lotteryText);

      const hitIndexes = getRandomNumberArray(
        0,
        lines.length - 1,
        this.lotteryCount,
        this.isDuplicationAllowed
      );

      const tempHitItems = hitIndexes.map((x) => lines[x]);

      this.hitItems = tempHitItems;
    },
    readFiles: function (inputFiles) {
      this.lotteryText = "";

      for (let i = 0; i < inputFiles.length; i++) {
        const file = inputFiles[i];

        if (!file) continue;

        if (this.maxFileSize < file.size) {
          alert(
            file.name +
              "\n" +
              "ファイルサイズが10MBを超えているためスキップします。"
          );
          continue;
        }

        const self = this;
        const reader = new FileReader();
        reader.fileName = file.name;

        reader.onload = function (e) {
          const codes = new Uint8Array(e.target.result);
          const detectedEncoding = Encoding.detect(codes);

          if (detectedEncoding == "UTF32") {
            const confirmResult = window.confirm(
              e.target.fileName +
                "\n" +
                "テキストファイルではないかもしれませんが、読み込みますか？"
            );
            if (!confirmResult) return;
          }

          const unicodeString = Encoding.convert(codes, {
            to: "unicode",
            from: detectedEncoding,
            type: "string",
          });

          self.lotteryText += unicodeString;
        };

        reader.readAsArrayBuffer(file);
      }
    },
    dragOver: function (event) {
      event.preventDefault();

      this.isDragOver = true;
    },
    dragLeave: function (event) {
      event.preventDefault();

      this.isDragOver = false;
    },
    drop: function (event) {
      event.preventDefault();

      const droppedFiles = event.dataTransfer.files;

      this.readFiles(droppedFiles);

      this.isDragOver = false;

      return false;
    },
    inputFileSelected: function (event) {
      this.readFiles(event.target.files);
    },
    getNotEmptyLines: function (text) {
      return text.split("\n").filter((x) => !x.match(/^\s*$/));
    },
    getValueInRange: function (value, min, max) {
      if (value < min) {
        return min;
      } else if (max < value) {
        return max;
      } else {
        return value;
      }
    },
  },
});
</script>