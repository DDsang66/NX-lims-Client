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
import Next from "@/Views/Review/Next.vue";
import Review from "@/Views/Review.vue";
import OVS from "@/Views/Review/OVS.vue";
import LPP from "@/Views/Review/LPP.vue";
import LTAG from "@/Views/Review/LTAG.vue";
import Focus from "@/Views/Review/Focus.vue";
import Woolworth from "@/Views/Review/Woolworth.vue";
import ExcelTry from "@/Views/ExcelTry.vue";
import FiberWorkSheet from "@/Views/FiberTeam/FiberWorkSheet.vue";
import ItemConfig from "@/Views/Config/ItemConfig.vue";
import StandardFamily from "@/Views/Config/StandardFamily.vue";
import StandardPage from "@/Views/Config/StandardPage.vue";
import BuyerManual from "@/Views/BuyerManual.vue";
import OrderOverview from "@/Views/OrderOverview.vue";
import WashLabel from "@/Views/WashLabel/WashLabel.vue";
import FormulaConfig from "@/Views/Config/FormulaConfig.vue";
import RuleConfig from "@/Views/Config/RuleConfig.vue";
import PhysicalWeight from "@/Views/Lab/PhysicalWeight.vue";
import AbrasionResistance_RotatingDrum from "@/Views/Lab/AbrasionResistance-RotatingDrum.vue";
import MenuManagement from "@/Views/Config/MenuManagement.vue";
import StructureConfig from "@/Views/Config/StructureConfig.vue";
import LogicValidation from "@/Views/Config/LogicValidation.vue";
import TemplateManagement from "@/Views/Config/TemplateManagement.vue";

const useRoleStore = defineStore('role', {
  state: () => ({
    role: localStorage.getItem('role') || 'Visitor',
    routeMap: new Map(Object.entries({
      Review: [{ path: 'Mango', name: 'Mango', component: Mango, meta: { title: 'MANGO' } },
      { path: 'OVS', name: 'OVS', component: OVS, meta: { title: 'OVS' } },
      { path: 'Tchibo', name: 'Tchibo', component: Tchibo, meta: { title: 'Tchibo' } },
      { path: 'Crazyline', name: 'CrazyLine', component: CrazyLine, meta: { title: 'Crazy Line' } },
      { path: 'Jako', name: 'Jako', component: Jako, meta: { title: 'JAKO' } },
      { path: 'ReviewFinish', name: 'ReviewFinish', component: ReviewFinish, meta: { title: 'Order Check Done' } },
      { path: 'Primark', name: 'Primark', component: Primark, meta: { title: 'Primark' } },
      { path: 'Kik', name: 'Kik', component: Kik, meta: { title: 'KiK' } },
      { path: 'Pep&co', name: 'Pep&co', component: Pepco, meta: { title: 'Pepco' } },
      { path: 'Next', name: 'Next', component: Next, meta: { title: 'NEXT' } },
      { path: 'LPP', name: 'LPP', component: LPP, meta: { title: 'LPP' } },
      { path: 'LTAG', name: 'LTAG', component: LTAG, meta: { title: 'LTAG' } },
      { path: 'Focus', name: 'Focus', component: Focus, meta: { title: 'Focus' } },
      { path: 'Woolworth', name: 'Woolworth', component: Woolworth, meta: { title: 'Woolworth' } },
      ],
      OrderEntry: [{ path: 'OrderEntry', name: 'OrderEntry', component: OrderEntry, meta: { title: 'Order Pick Up' } },],
      OrderSummary: [{ path: 'OrderSummary', name: 'OrderSummary', component: OrderSummary, meta: { title: 'Order Summary' } },],
      OrderReporting: [{ path: 'OrderReporting', name: 'OrderReporting', component: OrderReporting, meta: { title: 'Order Reporting' } },],
      LabOut: [{ path: 'LabOut', name: 'LabOut', component: LabOut, meta: { title: 'Order Lab Out' } }],
      Lab: [
        { path: 'ExcelTry', name: 'ExcelTry', component: ExcelTry, meta: { title: 'Work Sheet Edit' } },
        { path: 'Review', name: 'Review', component: Review, meta: { title: 'Review' } },
        { path: "BuyerManual", name: "BuyerManual", component: BuyerManual, meta: { title: 'Buyer Manual' } },
        { path: 'FiberWorkSheet', name: 'FiberWorkSheet', component: FiberWorkSheet, meta: { title: 'Fiber Team' } },
        { path: 'OrderOverview', name: 'OrderOverview', component: OrderOverview, meta: { title: 'Reporting List' } },
        { path: 'WashLabel', name: 'WashLabel', component: WashLabel, meta: { title: 'Wash Label' } },
        { path: 'PhysicalWeight', name: 'PhysicalWeight', component: PhysicalWeight, meta: { title: 'Physical Weight' } },
        { path: 'AbrasionResistance_RotatingDrum', name: 'AbrasionResistance_RotatingDrum', component: AbrasionResistance_RotatingDrum, meta: { title: 'Abrasion Resistance_Rotating Drum' } },
      ],
      LabManagement: [{ path: 'ItemConfig', name: 'ItemConfig', component: ItemConfig, meta: { title: 'Test Item Management' } },
      { path: 'StandardFamily', name: 'StandardFamily', component: StandardFamily, meta: { title: 'Standard Family' } },
      { path: 'StandardPage', name: 'StandardPage', component: StandardPage, meta: { title: 'Standard Management' } },
      { path: 'FormulaConfig', name: 'FormulaConfig', component: FormulaConfig, meta: { title: 'Formula Config' } },
      { path: 'RuleConfig', name: 'RuleConfig', component: RuleConfig, meta: { title: 'Rule Config' } },
      { path: 'MenuManagement', name: 'MenuManagement', component: MenuManagement, meta: { title: 'Menu Management' } },
        { path: 'StructureConfig', name: 'StructureConfig', component: StructureConfig, meta: { title: 'ParamStructure Config' } },
        { path: 'LogicValidation', name: 'LogicValidation', component: LogicValidation, meta: { title: 'LogicValidation' } },
        { path: 'TemplateManagement', name: 'TemplateManagement', component: TemplateManagement, meta: { title: 'TemplateManagement' } }
      ]
    }))
  }),
  getters: {
    getPower() {
      switch(this.role){
        case 'Visitor':
          return ['FAQ','PersonalCenter'];
        case 'Leader':
          return ['OrderReporting', 'OrderSummary', 'OrderEntry', 'Review', 'LabOut', 'LabManagement','Lab'];
        case 'Admin':
          return ['OrderReporting', 'OrderSummary', 'OrderEntry', 'Review', 'LabOut', 'LabManagement', 'Lab'];
        case 'Phy-Supervisor':
          return ['OrderReporting', 'OrderSummary', 'OrderEntry', 'Review', 'LabOut', 'Lab'];
        case 'Wet-Supervisor':
          return ['OrderReporting', 'OrderSummary', 'OrderEntry', 'Review', 'LabOut', 'Lab'];
        case 'Fiber-Supervisor':
          return ['OrderReporting', 'OrderSummary', 'OrderEntry', 'Review', 'LabOut', 'Lab'];
        case 'Flam-Supervisor':
          return ['OrderReporting', 'OrderSummary', 'OrderEntry', 'Review', 'LabOut', 'Lab'];
        case 'Reviewer':
          return ['Review', 'Lab'];
        case 'OrderEntry':
          return ['OrderEntry', 'Lab'];
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
