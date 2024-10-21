<template>
	<main class="mx-auto mb-20">
	  <input type="text" v-model="search" placeholder="Search for composers..." />
	  <table class="composer-list">
		<thead>
		  <tr>
			<th @click="sort('name')">Composer Name</th>
			<th @click="sort('dateOfBirth')">Date of Birth</th>
		  </tr>
		</thead>
		<tbody>
		  <tr v-for="(composer, i) in filteredComposers" :key="composer.id"
			  class="item cursor-pointer"
			  @click="fetchComposerDetails(composer.id)">
			<td class="p-2">{{ composer.name }}</td>
			<td class="p-2">{{ composer.dateOfBirth }}</td>
		  </tr>
		</tbody>
	  </table>
  
	  <div v-if="selectedComposer" class="composer-detail flex rounded mt-10 mb-10 p-4">
		<div class="profile">
		  <img :src="selectedComposer.img" class="profile-img rounded" />
		</div>
		<div class="details flex flex-row ml-5">
		  <div class="person-details mr-10">
			<h2 class="name">{{ selectedComposer.name }}</h2>
			<div><span class="item-label">Born</span>: {{ selectedComposer.dateOfBirth }}</div>
		  </div>
		  <div class="contact-details">
			<h4>Contact Info</h4>
			<div v-if="selectedComposer.contact">
			  <div><span class="item-label">Phone Number</span>: {{ selectedComposer.contact.phoneNumber }}</div>
			  <div><span class="item-label">Email</span>: {{ selectedComposer.contact.email }}</div>
			  <h5 class="mt-3">Address</h5>
			  <div>{{ selectedComposer.contact.address }}</div>
			</div>
		  </div>
		</div>
	  </div>
	</main>
  </template>
  
  <script>
  import axios from 'axios';
  
  export default {
	name: 'HomeView',
	data() {
	  return {
		composers: [],
		selectedComposer: null,
		search: '',
		sortKey: 'name',
		sortOrder: 1 // 1 for ascending, -1 for descending
	  };
	},
	computed: {
	  filteredComposers() {
		return this.composers
		  .filter(composer => composer.name.toLowerCase().includes(this.search.toLowerCase()))
		  .sort((a, b) => {
			if (a[this.sortKey] < b[this.sortKey]) return -1 * this.sortOrder;
			if (a[this.sortKey] > b[this.sortKey]) return 1 * this.sortOrder;
			return 0;
		  });
	  }
	},
	methods: {
	  async fetchComposers() {
		const response = await axios.get('http://localhost:8080/api/composers');
		this.composers = response.data;
	  },
	  async fetchComposerDetails(id) {
		const response = await axios.get(`http://localhost:8080/api/composers/${id}`);
		this.selectedComposer = response.data;
	  },
	  sort(key) {
		this.sortOrder = this.sortKey === key ? -this.sortOrder : 1;
		this.sortKey = key;
	  }
	},
	mounted() {
	  this.fetchComposers();
	}
  };
  </script>
  
  <style>
  
  </style>
  