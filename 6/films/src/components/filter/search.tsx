import { Box, TextField } from "@mui/material";
import { CHANGE_FILM_LIST, CLASS_SEARCH } from "./consts";
import { useState } from "react";
import { getInfo } from "../getInfo";
import { SEARCH_FILMS } from "../consts";
import { useFilterDispatch } from "./context";
import Cookie from "js-cookie";

export default function Search() {
  const dispatch = useFilterDispatch();
  const [input, setInput] = useState(Cookie.get("search"));
  const handleInput = (e: any) => {
    setInput(e.target.value);
    getInfo(SEARCH_FILMS, input).then((item) => {
      dispatch({
        type: CHANGE_FILM_LIST,
        films: item.results,
      });
    });
    if (input !== undefined) {
      Cookie.set("search", input);
    }
  };

  return (
    <Box className={CLASS_SEARCH}>
      <TextField
        className={CLASS_SEARCH}
        onChange={(e) => handleInput(e)}
        value={input}
        label="Поиск"
        variant="standard"
      />
    </Box>
  );
}