import { BrowserRouter, Routes, Route } from "react-router-dom";
import NewRandom from "./Component/NewRandomPage/NewRandom";
import Navigation from "./Component/Navigation/Navigation";
import Home from "./Component/Home/Home";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <div className="app-container">
        <Navigation />
        <div className="content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/new" element={<NewRandom />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
};

export default AppRoutes;
