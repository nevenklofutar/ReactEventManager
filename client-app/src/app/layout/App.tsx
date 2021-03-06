import React, { useEffect, Fragment, useContext } from "react";
import { Container } from "semantic-ui-react";
import ActivityDashboard from "../../features/activities/dashboard/ActivityDashboard";
import LoadingComponent from "./LoadingComponent";
import ActivityStore from '../stores/ActivityStore';
import { observer } from "mobx-react-lite";
import NavBar from "../../features/navbar/NavBar";

const App = () => {
   const activityStore = useContext(ActivityStore);

   useEffect(() => {
      activityStore.loadActivities();
   }, [activityStore]);

   if (activityStore.loadingInitial) return <LoadingComponent content="Loading ..."></LoadingComponent>;

   return (
      <Fragment>
         <NavBar />
         <Container style={{ marginTop: "7em" }}>
            <ActivityDashboard />
         </Container>
      </Fragment>
   );
};

export default observer(App);
