<template>
  <div>
    <v-app-bar color="deep-purple accent-4" dark>
      <v-app-bar-nav-icon></v-app-bar-nav-icon>

      <v-toolbar-title>{{title}}</v-toolbar-title>

      <div class="flex-grow-1"></div>
    </v-app-bar>

    <div v-if="loggedInState == false">
      <v-container fluid>
        <v-row>
          <v-col cols="12" sm="6">
            <h2>1) 상품정보</h2>
            <img width="360px" src="../assets/milk.png" />
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="12" sm="6">
            <h2>2) 주문자 정보</h2>
            <p>
              <v-text-field v-model="userName" label="성명" single-line maxlength="5" solo required></v-text-field>
            </p>
            <p>
              <v-text-field
                v-model="userNumber"
                label="연락처(-제외)"
                single-line
                maxlength="11"
                solo
                required
              ></v-text-field>
            </p>
            <v-btn :disabled="!userName || !userNumber" @click="logInUser">Box25 선택하기</v-btn>
          </v-col>
        </v-row>
      </v-container>
    </div>

    <div v-else>
      <v-container fluid>
        <v-row>
          <v-col cols="12" sm="6">
            <h2>1) 점포선택</h2>
            <v-radio-group v-model="selectedBranchCode" @change="searchBox25" row>
              <div v-for="post in stores.result.branchList" v-bind:key="post.branchCode">
                <v-radio
                  v-if="post.branchCode!='02158200004'"
                  :label="post.branchName"
                  :value="post.branchCode"
                ></v-radio>
              </div>
            </v-radio-group>
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="12" sm="6">
            <h2>2) BOX25 상태</h2>
            <div v-if="boxes!=''">
              <v-item-group>
                <v-container grid-list-md>
                  <v-layout wrap>
                    <v-flex v-for="box in boxes" :key="box.index" md2>
                      <v-item>
                        <v-card
                          :color="box.flag ? (box.index<=3 ? '#FF6C6C' : '#53a9f6') : '#5D5D5D'"
                          class="d-flex align-center"
                          height="100"
                          width="100"
                        >
                          <v-scroll-y-transition>
                            <div>{{box.index}}
                              <div v-if="!box.flag">주문불가</div>
                              <div v-else>주문가능</div>
                            </div>
                          </v-scroll-y-transition>
                        </v-card>
                      </v-item>
                    </v-flex>
                  </v-layout>
                </v-container>
              </v-item-group>
            </div>
            <div v-else>
              <p>점포를 먼저 선택해 주세요</p>
            </div>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12" sm="6">
            <div class="text-center">
              <v-dialog v-model="dialog" width="500">
                <template v-slot:activator="{ on }">
                  <v-btn
                    color="red lighten-2"
                    :disabled="!boxFlag"
                    v-on="on"
                    @click="order"
                  >Box25로 주문하기</v-btn>
                </template>

                <v-card>
                  <v-card-title class="headline grey lighten-2" primary-title>주문 완료</v-card-title>

                  <v-card-text>
                    <img src="../assets/check.png" />
                    <br />Box25를 이용해 주셔서 감사합니다.
                    <br />요청하신 우유200ml가 배송되면
                    <br />SMS로 "인증번호"가 발송됩니다.
                    <br />
                    <br />인증번호 수령 후 해당 Box25에 방문하시어
                    <br />1. QR코드를 스캔하시고
                    <br />2. 인증번호를 입력하시면 배송함이 개방됩니다.
                    <br />3. 물품수령
                    <br />4. 해당함을 꼭 닫아주세요.
                    <br />
                  </v-card-text>

                  <v-divider></v-divider>

                  <v-card-actions>
                    <div class="flex-grow-1"></div>
                    <v-btn color="primary" text @click="finishOrder">확인</v-btn>
                  </v-card-actions>
                </v-card>
              </v-dialog>
            </div>
          </v-col>
        </v-row>
      </v-container>
    </div>
  </div>
</template>

<script>
import Vuex from "vuex";

export default {
  name: "app",
  data() {
    return {
      userName: "",
      userNumber: "",
      stores: [],
      boxes: [],
      selectedBranchCode: "",
      dialog: false,
      title: "상품 주문하기",
      invoiceNo: "",
      selectedBoxNo: "",
      boxFlag: false
    };
  },
  computed: {
    hasResult: function() {
      return this.stores.length > 0;
    },

    loggedInState() {
      // access a modules state
      return this.$store.state.user.loggedIn;
    },

    // just an example - will mirror the mapState.firstName below
    getterFirstName() {
      // access a modules state
      return this.$store.getters.firstName;
    },

    ...Vuex.mapState(["greeting"]),

    // access modules state (not global so prepend the module name)
    ...Vuex.mapState({
      firstName: state => state.user.firstName
    }),

    ...Vuex.mapGetters(["fullName", "surname"]),

    ...Vuex.mapGetters({
      welcomeMessage: "userGreeting"
    })
  },
  methods: {
    searchStore: function() {
      // using JSONPlaceholder
      // 사내 api 로 삭제
      const baseURI = "";
      const data = {
        command: "getBranchList"
      };
      this.$http
        .post(`${baseURI}`, data)
        .then(result => {
          console.log(result);
          this.stores = result.data;
        })
        .catch(function() {
          alert(
            "오류가 발생하였습니다. 해당 오류가 지속될 시 관리자에게 문의해 주세요."
          );
          this.$router.go("/");
        });
    },

    // 함 현황 조회
    searchBox25: function() {
      this.boxFlag = false;
      // using JSONPlaceholder
      // 사내 api 로 삭제
      const baseURI = "";
      const data = {
        command: "getBoxStatus",
        branchCode: this.selectedBranchCode
      };
      this.$http
        .post(`${baseURI}`, data)
        .then(result => {
          const returnvalue = result.data.result;
          let array = new Array();
          for (let i = 1; i <= returnvalue.totalCount; i++) {
            let box = new Object();
            box.index = i;
            let flag = false;
            for (let j = 0; j < returnvalue.boxlist.length; j++) {
              if (returnvalue.boxlist[j].boxNo == i) {
                flag = true;
                this.boxFlag = true;
                break;
              }
            }
            box.flag = flag;
            array.push(box);
            console.log("box::" + box);
          }
          this.boxes = array;
        })
        .catch(function() {
          alert(
            "오류가 발생하였습니다. 해당 오류가 지속될 시 관리자에게 문의해 주세요."
          );
          this.$router.go("/");
        });
    },

    searchInvoiceNo: function() {
      // using JSONPlaceholder
      // 사내 api 로 삭제
      const baseURI = "";
      this.$http
        .get(`${baseURI}`)
        .then(result => {
          console.log(result);
          this.invoiceNo = result.data;
          this.selectBox25(result.data);
          this.regOrder(result.data);
        })
        .catch(function() {
          alert(
            "오류가 발생하였습니다. 해당 오류가 지속될 시 관리자에게 문의해 주세요."
          );
          this.$router.go("/");
        });
    },

    // 함 배정
    selectBox25: function(invoiceNo) {
      // using JSONPlaceholder
      // 사내 api 로 삭제
      const baseURI = "";
      const data = {
        command: "reserveBox",
        branchCode: this.selectedBranchCode,
        boxNo: this.selectedBoxNo,
        recvPhoneNo: this.userNumber,
        orderNo: invoiceNo
      };

      this.$http
        .post(`${baseURI}`, data)
        .then(result => {
          console.log(result);
          this.regInvoiceNo();
        })
        .catch(function() {
          alert(
            "오류가 발생하였습니다. 해당 오류가 지속될 시 관리자에게 문의해 주세요."
          );
          this.$router.go("/");
        });
    },

    // CVSnet 정보 등록 - 추가
    regOrder: function(invoiceNo) {
      // using JSONPlaceholder
      const config = {
        headers: {
          "Content-Type": "application/json"
        }
      };
      // 사내 api 로 삭제
      const baseURI = "";
      const data = {
        box: this.selectedBoxNo,
        branch: this.selectedBranchCode,
        name: this.userName,
        phone: this.userNumber
      };
      this.$http
        .post(`${baseURI}/${invoiceNo}`, JSON.stringify(data), config)
        .then(result => {
          console.log(result);
        })
        .catch(function() {
          alert(
            "오류가 발생하였습니다. 해당 오류가 지속될 시 관리자에게 문의해 주세요."
          );
          this.$router.go("/");
        });
    },

    // 송장 번호 등록
    regInvoiceNo: function() {
      // using JSONPlaceholder
      // 사내 api 로 삭제
      const baseURI = "";
      const data = {
        command: "regInvoiceNo",
        orderNo: this.invoiceNo,
        invoiceNo: this.invoiceNo
      };

      this.$http
        .post(`${baseURI}`, data)
        .then(result => {
          console.log(result);
        })
        .catch(function() {
          alert(
            "오류가 발생하였습니다. 해당 오류가 지속될 시 관리자에게 문의해 주세요."
          );
          this.$router.go("/");
        });
    },

    order: function() {
      for (let i = 0; i < this.boxes.length; i++) {
        if (this.boxes[i].flag == true) {
          this.selectedBoxNo = this.boxes[i].index;
          break;
        }
      }

      this.searchInvoiceNo();
    },

    logInUser() {
      // reference the renamed action below, calls this.$store.dispatch('authenticateUser', payload)
      this.loginThenSaveUser({
        firstName: this.userName,
        surname: this.userNumber
      });
      this.title = "배송지 선택";
      this.searchStore();
    },

    finishOrder() {
      // reference the renamed action below, calls this.$store.dispatch('authenticateUser', payload)
      this.dialog = false;
      this.$router.go("/");
    },

    // pass an array to reference the vuex store methods
    ...Vuex.mapMutations(["updateGreeting"]),

    // pass an object to rename
    ...Vuex.mapActions({
      loginThenSaveUser: "authenticateUser"
    })
  }
};
</script>

<style lang="css">
div {
  display: block;
  margin-left: auto;
  margin-right: auto;
}
</style>