import { useState, useEffect } from "react";
import { Autocomplete, TextField, CircularProgress, Box, Typography } from "@mui/material";
import axios from "axios";
import useDebounce from "./useDebounce"; // your existing debounce hook

const JobRoleSelector = ({ selectedRoleId, onRoleSelect }) => {
  const [input, setInput] = useState("");
  const [selectedRole, setSelectedRole] = useState(null);
  const [suggestedRoles, setSuggestedRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);


  const debouncedInput = useDebounce(input, 400);
  const baseUrl = "http://localhost:8001/usersOn";

  useEffect(() => {
    if (!debouncedInput) {
      setSuggestedRoles([]);
      return;
    }

    const fetchSuggestions = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${baseUrl}/search-roles`, {
          params: { query: debouncedInput }
        });

        if (response.data.success) {
          setSuggestedRoles(response.data.roles || []);
        }
      } catch (error) {
        console.error("Error fetching role suggestions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestions();
  }, [debouncedInput]);

  // Sync selectedRole when selectedRoleId or suggestions change
  useEffect(() => {
    if (!selectedRoleId) {
      setSelectedRole(null);
      return;
    }
    const existing = suggestedRoles.find((r) => r._id === selectedRoleId);
    if (existing) {
      setSelectedRole(existing);
    } else {
      // If selectedRoleId not in suggestions, fetch it manually
      const fetchRoleById = async () => {
        try {
          const res = await axios.get(`${baseUrl}/role/${selectedRoleId}`);
          if (res.data.success && res.data.role) {
            setSelectedRole(res.data.role);
          }
        } catch (err) {
          console.error("Error fetching selected role by ID", err);
        }
      };
      fetchRoleById();
    }
  }, [selectedRoleId, suggestedRoles]);

  return (
    <Box >
    

       <Typography sx={{ fontSize: '14px', fontWeight: 500, mb: 0.5}}>
                Select a role
              </Typography>

     <Autocomplete
     
  options={suggestedRoles}
  getOptionLabel={(option) => option.name || ""}
  loading={loading}
  value={selectedRole}
   open={dropdownOpen}
  onOpen={() => setDropdownOpen(true)}
  onClose={() => setDropdownOpen(false)}
   onChange={(event, newValue) => {
    setSelectedRole(newValue);
    onRoleSelect(newValue ? newValue._id : "");
    setDropdownOpen(false);
  }}
  inputValue={input}
  onInputChange={(event, newInputValue) => {
    setInput(newInputValue);
    setDropdownOpen(newInputValue.length > 0); // ✅ Open only when input has content
  }}
  filterOptions={(x) => x} // ✨ Prevent MUI default filtering
   noOptionsText={input.trim() === "" ? "Start typing..." : "No roles found"}
  renderInput={(params) => (
    <TextField
      {...params}
      variant="outlined"
      fullWidth
      slotProps={{ inputLabel: { sx: { fontSize: '14px' } } }}
      InputProps={{
        ...params.InputProps,
        endAdornment: (
          <>
            {loading ? <CircularProgress color="inherit" size={20} /> : null}
            {params.InputProps.endAdornment}
          </>
        )
      }}
    />
  )}
/>

    </Box>
  );
};

export default JobRoleSelector;
