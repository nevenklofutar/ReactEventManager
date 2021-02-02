import { action, computed, makeObservable, observable, configure, runInAction } from "mobx";
import { createContext, SyntheticEvent } from "react";
import agent from "../api/agent";
import { IActivity } from "../models/activity";

configure({enforceActions: "always"});

class ActivityStore {
   constructor() {
      makeObservable(this);
   }

   @observable activityRegistry = new Map();

   @observable activities: IActivity[] = [];
   @observable selectedActivity: IActivity | undefined = undefined;
   @observable loadingInitial = false;
   @observable editMode = false;
   @observable submitting = false;
   @observable target = '';

   @computed get activitiesByDate() {
      // return this.activities.slice().sort((a, b) => Date.parse(a.date) - Date.parse(b.date));
      return Array.from(this.activityRegistry.values()).sort((a, b) => Date.parse(a.date) - Date.parse(b.date));
   }

   @action loadActivities = async () => {
      this.loadingInitial = true;

      try {
         const activities = await agent.Activities.list();
         runInAction(() => {
            // solving problem with date format, removing miliseconds
            activities.forEach((activity) => {
               activity.date = activity.date.split(".")[0];
               // this.activities.push(activity);
               this.activityRegistry.set(activity.id, activity);
            });
         });
      } catch (error) {
         console.log(error);
      } finally {
         runInAction(() => {
            this.loadingInitial = false;
         });
      }
   };

   @action createActivity = async (activity: IActivity) => {
      this.submitting = true;

      try {
         await agent.Activities.create(activity);
         runInAction(() => {
            // this.activities.push(activity);
            this.activityRegistry.set(activity.id, activity);
            this.editMode = false;
         });
      } catch (error) {
         console.log(error);
      } finally {
         runInAction(() => {
            this.submitting = false;
         });
      }
   };

   @action openCreateForm = () => {
      this.editMode = true;
      this.selectedActivity = undefined;
   }

   @action editActivity = async (activity: IActivity) => {
      this.submitting = true;

      try {
         await agent.Activities.update(activity);
         runInAction(() => {
            this.activityRegistry.set(activity.id, activity);
            this.selectedActivity = activity;
            this.editMode = false;
         });
      } catch (error) {
         console.log(error);
      } finally {
         runInAction(() => {
            this.submitting = false;
         });
      }
   };

   @action openEditForm = (id: string) => {
      this.selectedActivity = this.activityRegistry.get(id);
      this.editMode = true;
   }

   @action deleteActivity = async (event: SyntheticEvent<HTMLButtonElement>, id: string) => {
      this.submitting = true;
      this.target = event.currentTarget.name;

      try {
         await agent.Activities.delete(id);
         runInAction(() => {
            this.activityRegistry.delete(id);
         });
      } catch (error) {
         console.log(error);
      } finally {
         runInAction(() => {
            this.submitting = false;
            this.target = '';
         });
      }
   }

   @action cancelSelectedActivity = () => {
      this.selectedActivity = undefined;
   }

   @action cancelFormOpen = () => {
      this.editMode = false;
   }

   @action selectActivity = (id: string) => {
      // this.selectedActivity = this.activities.find((a) => a.id === id);
      this.selectedActivity = this.activityRegistry.get(id);
      this.editMode = false;
   };
}

export default createContext(new ActivityStore());
