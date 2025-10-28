import { defineStore } from 'pinia';

const useRoleStore = defineStore('role', {
  state: () => ({
    role: localStorage.getItem('role') || 'Visitor',
  }),
  getters: {
    getPower(){
      switch(this.role){
        case 'Visitor':
          return ['FAQ','PersonalCenter'];
        case 'Leader':
          return ['OrderReporting','OrderSummary','OrderEntry','Review'];
        case 'Admin':
          return ['OrderReporting','OrderSummary','OrderEntry','Review'];
        case 'Phy-Supervisor':
          return ['OrderReporting','OrderSummary','OrderEntry','Review'];
        case 'Wet-Supervisor':
          return ['OrderReporting','OrderSummary','OrderEntry','Review'];
        case 'Fiber-Supervisor':
          return ['OrderReporting','OrderSummary','OrderEntry','Review'];
        case 'Flam-Supervisor':
          return ['OrderReporting','OrderSummary','OrderEntry','Review'];
        case 'Reviewer':
          return ['Review'];
        case 'OrderEntry':
          return ['OrderEntry'];
        default:
          return ['FAQ','PersonalCenter'];
      }
    },
    getGroups(){
      switch(this.role){
        case 'Phy-Supervisor':
          return ['Physics'];
        case 'Wet-Supervisor':
          return ['Wet'];
        case 'Fiber-Supervisor':
          return ['Fiber'];
        case 'Flam-Supervisor':
          return ['Flam'];
        default:
          return ['All','Physics','Wet','Fiber','Flam'];
      }
    },
    hasPower(){
      return (powerName)=>this.getPower.includes(powerName);
    }
  },
  actions: {
    setRole(role) {
      this.role = role;
    }
  }
});

export default useRoleStore;
