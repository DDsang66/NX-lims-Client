import { defineStore } from 'pinia';
import Mango from "@/Views/Mango.vue";
import Tchibo from "@/Views/Tchibo.vue";
import CrazyLine from "@/Views/CrazyLine.vue";
import Jako from "@/Views/Jako.vue";
import OrderEntry from "@/Views/OrderEntry.vue";
import OrderSummary from "@/Views/OrderSummary.vue";
import OrderReporting from "@/Views/OrderReporting.vue";

const useRoleStore = defineStore('role', {
  state: () => ({
    role: localStorage.getItem('role') || 'Visitor',
    routeMap:new Map(Object.entries({
      Review:[{ path: 'Mango', name: 'Mango', component: Mango },
        { path: 'Tchibo', name: 'Tchibo', component: Tchibo },
        { path: 'Crazyline', name: 'CrazyLine', component: CrazyLine },
        { path: 'Jako', name: 'Jako', component: Jako },],
      OrderEntry:[{path:'OrderEntry',name:'OrderEntry',component:OrderEntry},],
      OrderSummary:[{path:'OrderSummary',name:'OrderSummary',component:OrderSummary},],
      OrderReporting:[{path: 'OrderReporting', name: 'OrderReporting', component: OrderReporting },]
    }))
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
    },
    hasBigPower(){
      return (powerName)=>this.getPower.some((item)=>item.startsWith(powerName));
    },
    getRoutes(state){
      let routes = [];
      this.getPower.forEach((item)=>{
        if(state.routeMap.has(item))
        routes= routes.concat(state.routeMap.get(item));
      })
      return routes;
    }
  },
  actions: {
    setRole(role) {
      this.role = role;
    }
  }
});

export default useRoleStore;
