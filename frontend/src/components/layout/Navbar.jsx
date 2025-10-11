import React, { _useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../ui/button';
import { useAuth } from '../context/AuthContext';
import logo from '../../../public/logo.png';
import { 
  Brain, 
  Menu, 
  X, 
  User, 
  LogOut, 
  Globe,
  Moon,
  Sun,
  Bell
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';

export const Navbar = ({ 
  isDarkMode, 
  onThemeToggle
}) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Check if we're on a dashboard page
  const isDashboardPage = location.pathname.includes('-dashboard');

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 ${
      isDashboardPage 
        ? 'bg-transparent border-none' 
        : 'bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`flex justify-between items-center transition-all duration-300 ${
          isDashboardPage ? 'h-12' : 'h-16'
        }`}>
          {/* Logo */}
          <div 
            className={`flex items-center space-x-2 cursor-pointer transition-all duration-300 hover:scale-105 ${
              isDashboardPage ? 'opacity-80 hover:opacity-100' : ''
            }`}
            onClick={() => navigate('/')}
          >
            <div>
                 <img className="h-12 w-12 text-black"  src={logo}/>
            </div>
            <span className={`text-xl font-bold transition-all duration-300 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              NeuroPath
            </span>
          </div>

          {/* Right side - Only show on non-dashboard pages */}
          {!isDashboardPage && (
            <div className="flex items-center space-x-4">
              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center space-x-8">
                {!user && ['/', '/about', '/services', '/contact'].map((path) => (
                  <button
                    key={path}
                    onClick={() => navigate(path)}
                    className={`text-sm font-medium transition-colors ${
                      location.pathname === path
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400'
                    }`}
                  >
                    {path === '/' ? 'Home' : path.slice(1).charAt(0).toUpperCase() + path.slice(2)}
                  </button>
                ))}
              </div>

              {/* Theme Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={onThemeToggle}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
                title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>

              {user ? (
                <>
                  {/* Notifications */}
                  <Button variant="ghost" size="sm" className="p-2 relative">
                    <Bell className="h-4 w-4" />
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                      3
                    </Badge>
                  </Button>

                  {/* User Menu */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.avatar} alt={user.name} />
                          <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56 bg-white dark:bg-gray-800" align="end" forceMount>
                      <div className="flex  items-center justify-start gap-2 p-2">
                        <div className="flex flex-col space-y-1 leading-none">
                          <p className="font-medium">{user.name}</p>
                          <p className="w-[200px] truncate text-sm text-muted-foreground">
                            {user.email}
                          </p>
                          <Badge variant="secondary" className="w-fit text-xs">
                            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                          </Badge>
                        </div>
                      </div>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => navigate(`/${user.role}-dashboard`)}
                        className="cursor-pointer"
                      >
                        <User className="mr-2 h-4 w-4" />
                        Dashboard
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => {logout(); navigate('/');}} className="cursor-pointer">
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <div className="hidden md:flex items-center space-x-4">
                  <Button 
                    variant="outline" 
                    onClick={() => navigate('/login')}
                  >
                    Login
                  </Button>
                  <Button 
                    onClick={() => navigate('/signup')}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Sign Up
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};