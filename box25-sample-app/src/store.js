import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);
const userModule = {
  state: {
    firstName: "",
    surname: "",
    loggedIn: false
  },

  // @params state, getters, rootstate
  getters: {
    fullName: (state, getters, rootState) => {
      return `${state.firstName} ${state.surname}`;
    },
    userGreeting: (state, getters, rootState) => {
      return state.loggedIn
        ? `${rootState.greeting} ${getters.fullName}`
        : "Anonymous";
    },
    // although the 2 getters below match the states above, it is cleaner to retrieve module getters via mapGetters than it is states via mapStates as getters are global. Check the below component to see what I mean but this essentially means you can do this once, then you can shortern your component computed props when retrieving them. Which if you need them on a lot of components is pretty handy...
    firstName: state => state.firstName,
    surname: state => state.surname
  },

  // @params state
  mutations: {
    logIn: state => {
      state.loggedIn = true;
    },
    setName: (state, payload) => {
      state.firstName = payload.firstName;
      state.surname = payload.surname;
    }
  },

  // @params context
  // context.state, context.getters, context.commit (mutations), context.dispatch (actions)
  actions: {
    authenticateUser: (context, payload) => {
      if (!context.state.loggedIn) {
        window.setTimeout(() => {
          context.commit("logIn");
          context.commit("setName", payload);
        }, 500);
      }
    }
  }
};
export default new Vuex.Store({
  state: {
    greeting: "Welcome ..."
  },
  mutations: {
    updateGreeting: (state, payload) => {
      state.greeting = payload.message;
    }
  },
  modules: {
    user: userModule
  }
});
