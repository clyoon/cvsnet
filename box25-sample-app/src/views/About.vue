<template>
  <div class="about">
    <h1>This is an about page</h1>
    <div v-if="hasResult">
      <div v-for="post in posts" v-bind:key="post.id">
        <h1>{{ post.title }}</h1>
        <p>{{ post.body }}</p>
      </div>
    </div>
    <button v-else v-on:click="searchTerm">글 불러오기</button>
    <button v-on:click="searchTerm">선택하신 Box25로 주문하기</button>
  </div>
</template>

<script>
export default {
  name: "app",
  data: function() {
    return {
      posts: []
    };
  },
  computed: {
    hasResult: function() {
      return this.posts.length > 0;
    }
  },
  methods: {
    searchTerm: function() {
      // using JSONPlaceholder
      const baseURI = "https://jsonplaceholder.typicode.com";
      this.$http.get(`${baseURI}/posts`).then(result => {
        console.log(result);
        this.posts = result.data;
      });
    }
  }
};
</script>