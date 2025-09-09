import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios"
import { updateProduct } from "./productsSlice";

const API_URL=`${import.meta.env.VITE_BACKEND_URL}`
const USER_TOKEN=`Bearer ${localStorage.getItem("UserToken")}`

//async thunk to fetch admin products
export const fetchAdminProducts=createAsyncThunk(
    "adminProducts/fetchProducts",
    async()=>{
        const response=await axios.get(`${API_URL}/api/admin/products`,{
            headers:{
                Authorization:USER_TOKEN
            }
        })
        return response.data
    }
)

//async func to create a new product
export const createProduct=createAsyncThunk(
    "adminProducts/createProduct",
    async (productData)=>{
        const response=await axios.post(
            `${API_URL}/api/admin/products`,
            productData,
            {
                headers:{
                    Authorization:USER_TOKEN
                }
            }
        )
        return response.data
    }
)

//aysun func to update an existing data
export const UpdateProduct=createAsyncThunk(
    "adminProducts/updateProduct",
    async (productData,id)=>{
        const response=await axios.put(
            `${API_URL}/api/admin/products/${id}`,
            productData,id,
            {
                headers:{
                    Authorization:USER_TOKEN
                }
            }
        )
        return response.data

    }
)

export const DeleteProduct=createAsyncThunk(
    "adminProducts/deleteProduct",
    async (id)=>{
        const response=await axios.delete(
            `${API_URL}/api/admin/products/${id}`,
            id,
            {
                headers:{
                    Authorization:USER_TOKEN
                }
            }
        )
        return id

    }
)

const adminProductSlice=createSlice({
    name:"adminProducts",
    initialState:{
        products:[],
        loading:false,
        error:null,
    },
    reducers:{},
    extraReducers:(builder)=>{
        builder
        .addCase(fetchAdminProducts.pending,(state)=>{
            state.loading=true
        })
        .addCase(fetchAdminProducts.fulfilled,(state,action)=>{
            state.loading=false
            state.products=action.payload
        })
        .addCase(fetchAdminProducts.rejected,(state,action)=>{
            state.loading=false
            state.error=action.error.message
        })
        //create product
        .addCase(createProduct.fulfilled,(state,action)=>{
            state.products.push(action.payload)
        })
        //update product
        .addCase(updateProduct.fulfilled,(state,action)=>{
            const index=state.products.findIndex(
                (product)=>product._id===action.payload
            )
            if (index!==-1){
                state.products[index]=action.payload
            }
        })
        //delete product
        .addCase(DeleteProduct.fulfilled,(state,action)=>{
            state.products=state.products.filter(
                (product)=>product._id!==action.payload
            )
        })

    }
})

export default adminProductSlice.reducer