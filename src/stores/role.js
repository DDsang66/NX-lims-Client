import { defineStore } from 'pinia';
import Mango from "@/Views/Review/Mango.vue";
import Tchibo from "@/Views/Review/Tchibo.vue";
import CrazyLine from "@/Views/Review/CrazyLine.vue";
import Jako from "@/Views/Review/Jako.vue";
import OrderEntry from "@/Views/OrderEntry.vue";
import OrderSummary from "@/Views/OrderSummary.vue";
import OrderReporting from "@/Views/OrderReporting.vue";
import ReviewFinish from "@/Views/ReviewFinish.vue";
import LabOut from "@/Views/LabOut.vue";
import Primark from "@/Views/Review/Primark.vue";
import Kik from "@/Views/Review/Kik.vue";
import Pepco from "@/Views/Review/Pepco.vue";

const useRoleStore = defineStore('role', {
  state: () => ({
    role: localStorage.getItem('role') || 'Visitor',
    routeMap:new Map(Object.entries({
      Review:[{ path: 'Mango', name: 'Mango', component: Mango },
        { path: 'Tchibo', name: 'Tchibo', component: Tchibo },
        { path: 'Crazyline', name: 'CrazyLine', component: CrazyLine },
        { path: 'Jako', name: 'Jako', component: Jako },
        {path: 'ReviewFinish',name:'ReviewFinish',component:ReviewFinish},
        {path:'Primark',name: 'Primark', component: Primark},
        {path:'Kik',name:'Kik',component:Kik},
        {path:'Pep&co',name:'Pep&co',component:Pepco}
      ],
      OrderEntry:[{path:'OrderEntry',name:'OrderEntry',component:OrderEntry},],
      OrderSummary:[{path:'OrderSummary',name:'OrderSummary',component:OrderSummary},],
      OrderReporting:[{path: 'OrderReporting', name: 'OrderReporting', component: OrderReporting },],
      LabOut:[{path:'LabOut',name:'LabOut',component:LabOut}]
    }))
  }),
  getters: {
    getPower(){
      switch(this.role){
        case 'Visitor':
          return ['FAQ','PersonalCenter'];
        case 'Leader':
          return ['OrderReporting','OrderSummary','OrderEntry','Review','LabOut'];
        case 'Admin':
          return ['OrderReporting','OrderSummary','OrderEntry','Review','LabOut'];
        case 'Phy-Supervisor':
          return ['OrderReporting','OrderSummary','OrderEntry','Review','LabOut'];
        case 'Wet-Supervisor':
          return ['OrderReporting','OrderSummary','OrderEntry','Review','LabOut'];
        case 'Fiber-Supervisor':
          return ['OrderReporting','OrderSummary','OrderEntry','Review','LabOut'];
        case 'Flam-Supervisor':
          return ['OrderReporting','OrderSummary','OrderEntry','Review','LabOut'];
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
